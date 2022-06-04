import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
  createContext,
} from "react";
import { useThree } from "@react-three/fiber";
import { Object3D, Raycaster, Layers, Intersection, Group } from "three";
import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  interval,
  merge,
  Observable,
} from "rxjs";
import { distinctUntilChanged, map, withLatestFrom } from "rxjs/operators";
import {
  GLOBAL_POINTER_OVER_LAYER,
  GLOBAL_POINTER_OVER_MAX_DISTANCE,
} from "config";

import {
  useBehaviorSubjectAndSetterFromCurrentValue,
  useBehaviorSubjectFromCurrentValue,
} from "./useObservable";
import {
  useIsAddingElements$,
  useIsEditorOpen$,
} from "../Space/InSpaceEditor/hooks/useEditorStatus";
import {
  EditorState,
  EditorStatus,
  OptionalElementGroup,
  HasDisableInteractivity$,
  HasEnablePointerOverLayer$,
} from "Space/InSpaceEditor/types";
import { ElementConfig, ElementType } from "spaceTypes";

import styles from "css/controls.module.scss";
import useLodProperties from "./useLodProperties";

const DEFAULT_MAX_DISTANCE = 10000;

export const setPointerCursor = (
  canvas: HTMLCanvasElement | null | undefined,
  active: boolean
) => {
  if (canvas) {
    if (active && !canvas.classList.contains(styles.cursorPointer))
      canvas.classList.add(styles.cursorPointer);
    else if (!active && canvas.classList.contains(styles.cursorPointer))
      canvas.classList.remove(styles.cursorPointer);
  }
};
const currentPointingOver$ = new BehaviorSubject<Object3D | null>(null);

/**
 * when the intersection landed on a mesh,
 * we need to get the group so that we can have the transform info
 * in order for this to work,
 * the group has to be on GLOBAL_POINTER_OVER_LAYER too
 * @param obj
 */
const getClosestIntersection = (
  objs: Object3D[],
  rc: Raycaster
): Intersection | null => {
  let result: Intersection | null = null;
  const dfs = (objs: Object3D[]) => {
    for (const obj of objs) {
      //@ts-ignore
      if (obj.isMesh && obj.layers.test(rc.layers)) {
        const intersections = rc.intersectObject(obj, false);
        if (intersections.length > 0) {
          const intersection = intersections[0];
          if (!result || intersection.distance < result.distance) {
            result = intersection;
          }
        }
      }
      dfs(obj.children);
    }
  };

  dfs(objs);
  return result;
};

const findParentGroup = (
  obj: Object3D | null | undefined,
  raycasterLayers: Layers
): Object3D | null => {
  while (
    obj != null &&
    (obj.type !== "Group" || !obj.layers.test(raycasterLayers))
  ) {
    obj = obj.parent;
  }
  return obj || null;
};

export const useGlobalPointerOverObject$ = () => {
  const raycaster = useMemo(() => {
    const rc = new Raycaster();
    rc.far = 40;
    rc.layers.set(GLOBAL_POINTER_OVER_LAYER);
    return rc;
  }, []);
  const { camera, scene, gl } = useThree();

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera({ x, y }, camera);

      const intersection = getClosestIntersection(scene.children, raycaster);

      const parentGroup = findParentGroup(
        intersection?.object,
        raycaster.layers
      );
      currentPointingOver$.next(parentGroup);
      setPointerCursor(gl.domElement, parentGroup !== null);
    },
    [camera, gl.domElement, raycaster, scene.children]
  );

  useEffect(() => {
    const sub = merge(interval(100), fromEvent(gl.domElement, "mousedown"))
      .pipe(
        withLatestFrom(fromEvent(gl.domElement, "mousemove")),
        map((data) => data[1] as MouseEvent),
        distinctUntilChanged()
      )
      .subscribe((event) => {
        onMouseMove(event);
      });
    return () => {
      sub.unsubscribe();
    };
  }, [gl.domElement, onMouseMove]);
};

export const usePointerOverMe$ = (
  isMe: (obj: Object3D | null) => boolean,
  disabled = false
): BehaviorSubject<boolean> => {
  const pointerOver$ = useBehaviorSubjectFromCurrentValue<boolean>(false);

  useEffect(() => {
    if (disabled) return;
    const sub = currentPointingOver$
      .pipe(
        map((obj) => isMe(obj)),
        distinctUntilChanged()
      )
      .subscribe(pointerOver$);
    return () => {
      pointerOver$.next(false);
      sub.unsubscribe();
    };
  }, [disabled, isMe, pointerOver$]);

  return pointerOver$;
};

const useDisableInteractivity = (
  editorState: EditorState | undefined | null
): Observable<boolean> => {
  const [
    disableInteractivity$,
    setDisableInteractivity,
  ] = useBehaviorSubjectAndSetterFromCurrentValue(false);

  useEffect(() => {
    if (editorState) {
      const sub = editorState.status$
        .pipe(
          map((status) => status !== EditorStatus.closed),
          distinctUntilChanged()
        )
        .subscribe((shouldStop) => {
          setDisableInteractivity(shouldStop);
        });
      return () => {
        sub.unsubscribe();
      };
    }
  }, [editorState, setDisableInteractivity]);
  return disableInteractivity$;
};

const useEnablePointerOverLayerForEditor = (
  editorState: EditorState | undefined | null
): boolean => {
  const isAdding$ = useIsAddingElements$(editorState?.status$);
  const isOpen$ = useIsEditorOpen$(editorState?.status$);
  const [enable, setEnable] = useState(false);

  useEffect(() => {
    const sub = combineLatest([isAdding$, isOpen$])
      .pipe(
        map(([adding, open]) => open && !adding),
        distinctUntilChanged()
      )
      .subscribe(setEnable);
    return () => {
      sub.unsubscribe();
    };
  }, [isAdding$, isOpen$]);

  return enable;
};

const useEnablePointerOverLayerForInteractivity = (
  elementConfig: ElementConfig
) => {
  const [enabledAndConfig, setEnabledAndConfig] = useState({
    enabled: false,
    distance: 0,
  });

  useEffect(() => {
    const getConfig = () => {
      if (elementConfig.elementType === ElementType.image)
        return elementConfig.image;
      if (elementConfig.elementType === ElementType.model)
        return elementConfig.model;
      if (elementConfig.elementType === ElementType.placard)
        return elementConfig.placard;
      if (elementConfig.elementType === ElementType.video)
        return elementConfig.video;
      if (elementConfig.elementType === ElementType.nft)
        return elementConfig.nft;
    };
    const config = getConfig();
    const enabled =
      !!config?.interactable || elementConfig.elementType === ElementType.nft;

    const maxDistance =
      config?.interactableConfig?.payload?.maxDistance || DEFAULT_MAX_DISTANCE;

    setEnabledAndConfig({ enabled, distance: maxDistance });
  }, [elementConfig]);

  return enabledAndConfig;
};

export type PointerOvertContextType = HasEnablePointerOverLayer$ &
  HasDisableInteractivity$;
export const PointerOverContext = createContext<PointerOvertContextType | null>(
  null
);

/**
 *
 * @param editorState
 * @param elementConfig
 * @returns
 */
export const useDynamicGlobalPointerOverLayer = (
  editorState: EditorState | undefined | null,
  elementConfig: ElementConfig,
  disabled?: boolean
): {
  setElementGroup: Dispatch<SetStateAction<Group | null>>;
} & HasEnablePointerOverLayer$ &
  OptionalElementGroup &
  HasDisableInteractivity$ => {
  const [elementGroup, setElementGroup] = useState<Group | null>(null);
  const disableInteractivity$ = useDisableInteractivity(editorState);

  const enableForEditor = useEnablePointerOverLayerForEditor(editorState);
  const enabledForInteractivityWithDistance = useEnablePointerOverLayerForInteractivity(
    elementConfig
  );

  const distanceProperties = useMemo(
    () => ({
      canSelectToEdit: enableForEditor
        ? GLOBAL_POINTER_OVER_MAX_DISTANCE
        : Number.POSITIVE_INFINITY,
      canInteract: enabledForInteractivityWithDistance.enabled
        ? enabledForInteractivityWithDistance.distance
        : Number.POSITIVE_INFINITY,
    }),
    [
      enableForEditor,
      enabledForInteractivityWithDistance.distance,
      enabledForInteractivityWithDistance.enabled,
    ]
  );

  const lodProperties = useLodProperties({
    distancedProperties: distanceProperties,
    mesh: elementGroup,
    distanceCheckInterval: 100,
    disabled,
  });

  const enabledPointerOverLayer = !!lodProperties?.canInteract;

  const enablePointerOverLayer$ = useBehaviorSubjectFromCurrentValue(
    enabledPointerOverLayer
  );

  return {
    enablePointerOverLayer$,
    elementGroup,
    setElementGroup,
    disableInteractivity$,
    canInteract: !!lodProperties?.canInteract,
    canSelectToEdit: !!lodProperties?.canSelectToEdit,
  };
};
