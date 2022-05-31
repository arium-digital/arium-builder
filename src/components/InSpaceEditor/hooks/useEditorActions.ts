import { saveNewElement } from "Editor/components/Elements/New";
import { useIsEditorOpen } from "components/InSpaceEditor/hooks/useEditorStatus";
import { asIVector3 } from "libs/utils";
import { last, merge } from "lodash";
import { useCallback } from "react";
import { ElementConfig } from "spaceTypes";
import { Object3D } from "three";
import { EditorState, EditorStatus } from "../types";
import { PushUndoItemFunction } from "Editor/hooks/useUndo";
import { useCurrentValueFromObservable } from "hooks/useObservable";

export const useStartAddingNewElementAction = ({
  editorState,
  defaultElementConfig,
  newElementConfig,
  sideEffects,
}: {
  editorState: EditorState;
  defaultElementConfig: () => ElementConfig;
  newElementConfig: () => Partial<ElementConfig>;
  sideEffects: Array<() => void>;
}): (() => void) => {
  const {
    setPreviewElement,
    setCurrentEditingElementAndPath,
    setStatus,
  } = editorState;
  const action = useCallback(() => {
    const defaultConfig = defaultElementConfig();
    // const defaultToShow = merge(
    //   {},
    //   defaultElementConfig(),
    //   newElementConfig ? newElementConfig() : {}
    // );
    const newElement: ElementConfig = {
      elementType: defaultConfig.elementType,
      name: defaultConfig.name,
      active: true,
      ...(newElementConfig ? newElementConfig() : {}),
    };

    setPreviewElement({
      defaults: merge({}, defaultElementConfig(), newElement),
      toSave: newElement,
    });
    setCurrentEditingElementAndPath(null);
    setStatus(EditorStatus.adding);
    sideEffects.forEach((fn) => fn());
  }, [
    setPreviewElement,
    setCurrentEditingElementAndPath,
    setStatus,
    defaultElementConfig,
    newElementConfig,
    sideEffects,
  ]);
  return action;
};

export const useCancelAddingElements = (editorState: EditorState) => {
  const handleCancleAddingElements = useCallback(() => {
    editorState.setPreviewElement(null);
  }, [editorState]);

  return handleCancleAddingElements;
};

export const useCloseEditorAction = (editorState: EditorState) => {
  const closeHandler = useCallback(() => {
    editorState.setCurrentEditingElementAndPath(null);
    editorState.setPreviewElement(null);
    editorState.setSaving(false);
    editorState.setStatus(EditorStatus.closed);
  }, [editorState]);
  return closeHandler;
};
export const useOpenEditorAction = (editorState: EditorState) => {
  const action = useCallback(
    () => editorState.setStatus(EditorStatus.selectingElement),
    [editorState]
  );

  return action;
};

export const useToggleEditorAction = (editorState: EditorState) => {
  const open = useOpenEditorAction(editorState);
  const close = useCloseEditorAction(editorState);
  const isOpen = useIsEditorOpen(editorState.status$);
  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [close, isOpen, open]);
  return toggle;
};

export const useSaveCurrentPreviewToDB = ({
  editorState,
  previewRef,
  toShowInitially,
  toSave: elementConfig,
  pushUndoItem,
}: {
  editorState: EditorState;
  previewRef: { current: Object3D | undefined };
  toShowInitially: ElementConfig;
  toSave: ElementConfig;
  pushUndoItem?: PushUndoItemFunction;
}) => {
  const saving = useCurrentValueFromObservable(editorState.saving$, false);
  const action = useCallback(
    async (setAtZero?: boolean) => {
      if (saving) return;
      if (previewRef.current) {
        editorState.setSaving(true);
        editorState.setMessage("Saving new element...");
        const transform = setAtZero
          ? {
              position: {
                x: 0,
                y: 0,
                z: 0,
              },
              rotation: {
                x: 0,
                y: 0,
                z: 0,
              },
            }
          : {
              position: asIVector3(previewRef.current.position),
              rotation: asIVector3(previewRef.current.rotation),
            };

        const toSave: ElementConfig = {
          ...elementConfig,
          transform: merge({}, elementConfig.transform, transform),
        };

        const saved = await saveNewElement(
          editorState.spaceId,
          [],
          toSave,
          pushUndoItem
        );
        const newId = last(saved.path);
        if (newId === undefined)
          throw new Error("Failed to get new element ID after saving");

        editorState.setMessage("Saved!");
        setTimeout(() => editorState.setMessage(null), 1000);
        editorState.setPreviewElement(null);
        editorState.setCurrentEditingElementAndPath({
          path: [newId],
          initialValues: {
            ...toShowInitially,
            transform,
          },
          element: previewRef.current,
        });
        editorState.setStatus(EditorStatus.editingElement);
        editorState.setSaving(false);
        return newId;
      }
    },
    [
      saving,
      previewRef,
      editorState,
      elementConfig,
      pushUndoItem,
      toShowInitially,
    ]
  );

  return action;
};

// export const useCloseEditorAction = (editorState: EditorState): FnVoid => {
//   return () => {};
// };
