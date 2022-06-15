import { useThree } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
} from "react";
import { BehaviorSubject, fromEvent, Subject } from "rxjs";
import { withLatestFrom, filter, map } from "rxjs/operators";
import { Object3D } from "three";
import { InteractableElement } from "../spaceTypes/interactable";
import {
  PointerOverContext,
  PointerOvertContextType,
  usePointerOverMe$,
} from "./useGlobalPointerOver";
import { useCurrentValueFromObservable } from "./useObservable";

export const useClicked$AndPointerOver$ = (
  elementId: string,
  disabled?: boolean
): {
  clicked$: Subject<Event>;
  pointerOver$: BehaviorSubject<boolean>;
} => {
  const clicked$: Subject<Event> = useMemo(() => new Subject(), []);
  const isMe = useCallback(
    (obj: Object3D | null) => {
      if (!obj) return false;
      return obj.name === elementId;
    },
    [elementId]
  );
  const pointerOver$ = usePointerOverMe$(isMe, disabled);

  const { gl } = useThree();

  useEffect(() => {
    if (disabled) return;

    const sub = fromEvent(gl.domElement, "mouseup")
      .pipe(
        withLatestFrom(fromEvent(gl.domElement, "mousedown"), pointerOver$),
        filter(
          ([mouseUpEvent, mouseDownEvent, pointerOver]) =>
            mouseUpEvent.timeStamp - mouseDownEvent.timeStamp < 300 &&
            pointerOver
        ),
        map(([mouseUpEvent, ...rest]) => mouseUpEvent)
      )
      .subscribe(clicked$);

    return () => {
      sub.unsubscribe();
    };
  }, [gl, disabled, clicked$, pointerOver$]);

  return { clicked$, pointerOver$ };
};

export type InteractableContextType = ReturnType<
  typeof useClicked$AndPointerOver$
> &
  PointerOvertContextType & { disableInteractivity: boolean };

export const InteractableContext = createContext<InteractableContextType | null>(
  null
);

/**
 *
 * @param mesh
 * @param config InteractableElement
 * @param disabled
 * @returns
 */
export const useInteractable = (
  elementId: string,
  config: InteractableElement | undefined
): InteractableContextType | null => {
  const pointerOverContext = useContext(PointerOverContext);

  const disabled = useCurrentValueFromObservable(
    pointerOverContext?.disableInteractivity$,
    false
  );

  const [checkForInteractable, setCheckForInteractable] = useState(false);

  useEffect(() => {
    if (config?.interactable && config?.interactableConfig && !disabled) {
      setCheckForInteractable(true);
    } else {
      setCheckForInteractable(false);
    }
  }, [config?.interactable, config?.interactableConfig, disabled]);

  const clicked$AndPointerOver$ = useClicked$AndPointerOver$(
    elementId,
    !checkForInteractable
  );

  if (!pointerOverContext) return null;

  return {
    ...clicked$AndPointerOver$,
    ...pointerOverContext,
    disableInteractivity: disabled,
  };
};
