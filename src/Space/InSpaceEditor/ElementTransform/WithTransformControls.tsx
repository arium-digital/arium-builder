import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ElementConfig } from "spaceTypes";
import { EditorState, EditorStatus } from "Space/InSpaceEditor/types";
import { Object3D /*, Vector3*/, Vector3 } from "three";
import { useClicked$AndPointerOver$ } from "hooks/useInteractable";
import { withLatestFrom } from "rxjs/operators";
// import { useEditElementAction } from "../hooks/useEditorActions";
import {
  useBehaviorSubjectFromCurrentValue,
  useCurrentValueFromObservable,
} from "hooks/useObservable";
import { arraysEqual } from "libs/utils";
import { TransformControls } from "@react-three/drei";
import { useAutoSaveTransform } from "../hooks/useAutoSaveTransform";
import { TransformControls as ThreeTransformControls } from "three-stdlib";
import { NestedFormProp } from "Editor/components/Form";
import { useSpring } from "react-spring";
import { useThree } from "@react-three/fiber";
import FreeFlyOrbitControls from "./FreeFlyOrbitControls";
import { Optional } from "types";

const AnimateCameraPositionTo = ({
  from,
  target,
  lookAt,
  onComplete,
}: {
  from: Vector3;
  target: Vector3;
  lookAt: Vector3;
  onComplete: () => void;
}) => {
  const { camera } = useThree();

  useEffect(() => {
    // we need to round the values, because it wont animate with spring and on rest wont fire
    const equal = arraysEqual(
      from.toArray().map((x) => Math.round(x)),
      target.toArray().map((x) => Math.round(x))
    );
    if (equal) {
      onComplete();
    }
  }, [from, target, onComplete]);

  useSpring({
    from: {
      x: from.x,
      y: from.y,
      z: from.z,
    },
    to: {
      x: target.x,
      y: target.y,
      z: target.z,
    },
    config: {
      mass: 2,
      friction: 50,
    },
    onChange: ({ value: { x, y, z } }) => {
      camera.position.set(x, y, z);
      if (lookAt) camera.lookAt(lookAt);
    },
    onRest: () => {
      onComplete();
    },
  });

  return null;
};

const TransformAndAutoSave = ({
  editorState,
  setControllingCamera,
  setDragging,
}: {
  editorState: EditorState;
  setControllingCamera: (controlling: boolean) => void;
  setDragging: (dragging: boolean) => void;
}) => {
  const { transformControls, setTransformControls } = editorState;

  // const { camera } = useThree();

  const { nestedForm } = editorState;

  const elementActive = nestedForm?.sourceValues?.active !== false;
  const elementDeleted = nestedForm?.sourceValues?.deleted === true;
  const elementLocked = !!nestedForm?.sourceValues?.locked;

  const target =
    elementActive && !elementDeleted && editorState?.currentEditingElement;
  const cameraMode = editorState.cameraMode;

  useEffect(() => {
    return () => setControllingCamera(false);
  }, [setControllingCamera]);

  useEffect(() => {
    if (!transformControls) return;
    function setDraggingOnTransform() {
      if (!transformControls) return;
      const callback = (event: any) => setDragging(!!event.value);
      transformControls.addEventListener("dragging-changed", callback);
      return () => {
        transformControls.removeEventListener("dragging-changed", callback);
        setDragging(false);
      };
    }

    return setDraggingOnTransform();
  }, [setDragging, transformControls]);

  const { transformControlsSnap } = editorState;

  useEffect(() => {
    if (target && transformControls) {
      transformControls.attach(target);

      return () => {
        transformControls.detach();
      };
    }
  }, [target, transformControls]);

  useEffect(() => {
    if (transformControls) {
      // cleanup
      return () => {
        transformControls.detach();
      };
    }
  }, [transformControls]);

  const [animateCameraPosition, setAnimateCameraPosition] = useState<
    | {
        from: Vector3;
        to: Vector3;
        lookAt: Vector3;
      }
    | undefined
  >();

  const animateCameraToOriginalComplete = useCallback(() => {
    // setTargetState((existing) => ({
    //   ...existing,
    //   exitingFromCameraPosition: null,
    // }));
    setControllingCamera(false);
    setAnimateCameraPosition(undefined);
  }, [setControllingCamera]);

  const isClosed = editorState.isClosed;

  const transformControlsEnabled =
    !isClosed &&
    !!target &&
    !!editorState.transformControlsMode &&
    !elementLocked;

  return (
    <>
      {/* {target && ( */}
      <TransformControls
        mode={editorState.transformControlsMode || "translate"}
        rotationSnap={transformControlsSnap ? Math.PI / 2 : null}
        translationSnap={transformControlsSnap ? 0.2 : null}
        scaleSnape={transformControlsSnap ? 0.1 : null}
        // onMouseUp={transformComplete}
        // @ts-ignore
        ref={setTransformControls}
        enabled={transformControlsEnabled}
        showX={transformControlsEnabled}
        showY={transformControlsEnabled}
        showZ={transformControlsEnabled}
      />
      {/* )} */}

      {cameraMode === "orbit" && !isClosed && (
        <FreeFlyOrbitControls
          transformControls={transformControls}
          animateCameraPosition={setAnimateCameraPosition}
          setControllingCamera={setControllingCamera}
        />
      )}
      {animateCameraPosition && (
        <AnimateCameraPositionTo
          from={animateCameraPosition.from}
          target={animateCameraPosition.to}
          onComplete={animateCameraToOriginalComplete}
          lookAt={animateCameraPosition.lookAt}
        />
      )}
      {transformControls && nestedForm && (
        <AutoSaveTransform
          transformControls={transformControls}
          nestedForm={nestedForm}
        />
      )}
    </>
  );
};

const AutoSaveTransform = ({
  nestedForm,
  transformControls,
}: {
  nestedForm: NestedFormProp<ElementConfig>;
  transformControls: ThreeTransformControls;
}) => {
  useAutoSaveTransform(nestedForm, transformControls);

  return null;
};

export const useEditingElementState = ({
  editorState,
  elementPath,
  elementGroup,
  disabled,
  handleSelected,
}: {
  editorState: EditorState | undefined;
  elementPath: string[];
  elementGroup: Optional<Object3D>;
  disabled?: boolean;
  handleSelected: () => void;
}) => {
  const currentEditingElementPath = editorState?.currentEditingElementPath;

  const isEditingMe = useMemo(
    () =>
      currentEditingElementPath &&
      arraysEqual(currentEditingElementPath, elementPath),
    [currentEditingElementPath, elementPath]
  );

  const setCurrentEditingElement = editorState?.setCurrentEditingElementAndPath;

  useEffect(() => {
    if (isEditingMe && elementGroup && setCurrentEditingElement) {
      setCurrentEditingElement((existing) => {
        if (!existing) return;

        if (existing.element !== elementGroup)
          return {
            ...existing,
            element: elementGroup,
          };

        return existing;
      });
    }
  }, [isEditingMe, elementGroup, setCurrentEditingElement]);

  const elementId = elementPath[elementPath.length - 1];
  const { clicked$, pointerOver$ } = useClicked$AndPointerOver$(
    elementId,
    disabled
  );

  const isEditingMe$ = useBehaviorSubjectFromCurrentValue(isEditingMe);

  const editorStatus$ = editorState?.status$;

  useEffect(() => {
    if (!editorStatus$) return;
    const sub = clicked$
      .pipe(withLatestFrom(editorStatus$, isEditingMe$))
      .subscribe(([, status, isEditingMe]) => {
        if (isEditingMe) return;
        if (status === EditorStatus.adding) return;
        handleSelected();
      });
    return () => {
      sub.unsubscribe();
    };
  }, [clicked$, editorStatus$, handleSelected, isEditingMe$]);

  const pointerOver = useCurrentValueFromObservable(pointerOver$, false);

  return {
    isEditingMe,
    pointerOver,
  };
};

export const EditorTransformAndOrbitControls = ({
  editorState,
  setControllingCamera,
  setDragging,
}: // position
{
  editorState: EditorState;
  setControllingCamera: (controlling: boolean) => void;
  setDragging: (dragging: boolean) => void;
  // position: RefObject<Vector3 | undefined>;
}) => {
  const canTransform = editorState != null && editorState.userHasEditPermission;

  if (!canTransform) return null;

  return (
    <>
      <TransformAndAutoSave
        editorState={editorState}
        setControllingCamera={setControllingCamera}
        setDragging={setDragging}
      />
    </>
  );
};
