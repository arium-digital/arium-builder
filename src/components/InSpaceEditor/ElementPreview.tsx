import { Object3D, Vector3 } from "three";
import { useCursorIntersection } from "hooks/useCursorIntersection";
import React, { useEffect, useMemo, useRef } from "react";
import { ElementToAdd, HasEditorState } from "./types";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { fromEvent, timer } from "rxjs";
import { ElementConfig, ElementType } from "spaceTypes/Element";
import { useSaveCurrentPreviewToDB } from "./hooks/useEditorActions";
import { useFrame } from "@react-three/fiber";
import RenderElementByTypeInner, {
  MinimalElementProps,
} from "components/Elements/Tree/RenderElementByType";
import merge from "lodash/merge";
import { exhaustMap, first, switchMap } from "rxjs/operators";

type PreviewElementsProps = Omit<
  MinimalElementProps,
  | "elementConfig"
  | "elementId"
  | "disableInteractivity$"
  | "enablePointerOverLayer$"
>;
const ElementPreview = ({
  elementToRender,
  editorState,
  ...rest
}: HasEditorState &
  PreviewElementsProps & {
    elementToRender: ElementToAdd;
  }) => {
  const groupRef = useRef<Object3D>();
  const toShow = useMemo(
    () => merge({}, elementToRender.defaults, elementToRender.toSave),
    [elementToRender.defaults, elementToRender.toSave]
  );
  const disableCursorIntersection = useMemo(() => {
    const snapElementTypes: ElementType[] = [
      ElementType.image,
      ElementType.nft,
      ElementType.video,
      ElementType.placard,
    ];

    const shouldSnap = snapElementTypes.includes(toShow.elementType);

    return !shouldSnap;
  }, [toShow.elementType]);
  const cursorIntersection = useCursorIntersection({
    disable: disableCursorIntersection,
  });
  const saveCurrentPreviewElementToDB = useSaveCurrentPreviewToDB({
    editorState,
    previewRef: groupRef,
    toShowInitially: toShow,
    toSave: elementToRender.toSave as ElementConfig,
    pushUndoItem: editorState.undoInstance.pushUndoItem,
  });

  const targetPositionRef = useRef(new Vector3());
  const distanceRef = useRef(new Vector3());

  useFrame(() => {
    if (!cursorIntersection.current) return;
    const {
      normal,
      intersection,
      mouseDirection,
      mouseOrigin,
    } = cursorIntersection.current;
    const group = groupRef.current;
    if (group) {
      if (normal && intersection) {
        const target = intersection.point.clone().add(normal);
        group.lookAt(target);
        group.position.set(...intersection.point.toArray());
      } else {
        const targetPosition = targetPositionRef.current;
        const distance = distanceRef.current;
        targetPosition.copy(mouseOrigin);
        distance.copy(mouseDirection).multiplyScalar(5);

        targetPosition.add(distance);
        // console.log({
        //   mouseOrigin,
        //   mouseDirection,
        //   targetPosition
        // })
        group.position.copy(targetPosition);
        group.rotation.set(0, 0, 0);
      }
    }
  });

  // useEffect(() => {
  //   console.log({
  //     toShow,
  //     defaults: elementToRender.defaults,
  //     toSave: elementToRender.toSave,
  //   });
  // }, [toShow, elementToRender]);

  const isGroup = toShow.elementType === ElementType.group;

  useEffect(() => {
    const setToZero = true;
    if (isGroup) saveCurrentPreviewElementToDB(setToZero);
  }, [isGroup, saveCurrentPreviewElementToDB]);

  useEffect(() => {
    const sub = timer(500)
      .pipe(
        first(),
        switchMap(() => {
          return fromEvent(document.body, "click").pipe(
            exhaustMap(async () => {
              await saveCurrentPreviewElementToDB();
            })
          );
        })
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [saveCurrentPreviewElementToDB]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    editorState.setMessage(
      `Point your mouse to where you want to place this ${toShow.elementType}`
    );
    return () => {
      editorState.setMessage(null);
    };
  }, [editorState, toShow.elementType]);

  return (
    <>
      <group ref={groupRef}>
        <RenderElementByTypeInner
          {...rest}
          elementId={"preview"}
          elementConfig={toShow}
          disableCursorIntersectionDetection
          showHelper
          handleElementLoaded={undefined}
        />
      </group>
    </>
  );
};

export const RenderElementPreviewAtCursor = ({
  editorState,
  ...rest
}: HasEditorState & PreviewElementsProps) => {
  const previewElementData = useCurrentValueFromObservable(
    editorState.previewElement$,
    null
  );
  if (previewElementData == null) return null;
  return (
    <ElementPreview
      editorState={editorState}
      elementToRender={previewElementData}
      {...rest}
    />
  );
};
