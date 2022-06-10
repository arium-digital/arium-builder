import {
  CameraMode,
  CurrentEditingElementAndPath,
  EditorState,
  EditorStatus,
  ElementToAdd,
  PeerSelection,
} from "Space/InSpaceEditor/types";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ElementConfig } from "spaceTypes";
import {
  useBehaviorSubjectAndSetterFromCurrentValue,
  useBehaviorSubjectFromCurrentValue,
} from "../../../hooks/useObservable";
import { useUndo } from "Editor/hooks/useUndo";
import { TransformControls } from "three-stdlib";
import { useRouter } from "next/router";
import { useValidateAndUpdate } from "Editor/hooks/updateAndCreate";
import { ElementSchema } from "Editor/formAndSchema";
import { store } from "db";
import { Optional } from "types";
import { last } from "lodash";
import useSpaceRoles from "./useSpaceRoles";
// import { extractElementConfig } from "defaultConfigs/conversions";

export const editModeQueryParamKey = "editMode";

export const EditorContext = createContext<EditorState | null>(null);

const useNestedElementFormAndSelectElement = ({
  spaceId,
}: {
  spaceId: string | undefined;
}) => {
  const [
    currentEditingElementAndPath,
    setCurrentEditingElementAndPath,
  ] = useState<Optional<CurrentEditingElementAndPath>>(null);

  const currentEditingElementPath = currentEditingElementAndPath?.path;
  const elementIsSelected =
    !!currentEditingElementPath && currentEditingElementPath.length !== 0;

  const path = currentEditingElementAndPath?.path;

  const elementId = useMemo(() => (path ? last(path) : undefined), [path]);

  const elementRef = useMemo(() => {
    if (!elementId || !spaceId) return undefined;

    return store
      .collection("spaces")
      .doc(spaceId)
      .collection("elementsTree")
      .doc(elementId);
  }, [spaceId, elementId]);

  const undoInstance = useUndo();

  const { nestedForm } = useValidateAndUpdate<ElementConfig>({
    keepAlive: true,
    ref: elementRef,
    schema: ElementSchema,
    autoSave: true,
    pushUndoItem: undoInstance.pushUndoItem,
    initialValues: currentEditingElementAndPath?.initialValues,
    // converter: extractElementConfig,
  });

  return {
    setCurrentEditingElementAndPath,
    nestedForm,
    currentEditingElement: currentEditingElementAndPath?.element,
    currentEditingElementPath,
    undoInstance,
    elementIsSelected,
  };
};

export const isEditingUsers = (editorState: EditorState | null) => {
  return editorState?.status === EditorStatus.editingUsers;
};

export const isSelecting = (editorState: EditorState | null) => {
  return editorState?.status === EditorStatus.selectingElement;
};

/**
 * Please only call this hook only once in the whole project.
 * if `editMode=true` in the query parameters, it'll init the editor in editing mode.
 * @param canEdit does the user has `editor` permission?
 * the hook will return undefined if not editor.
 * @param camera the main camera of the scene
 * @param scene the scene object
 * @returns EditorState
 */
export const useInitEditorState = (
  spaceId: string | undefined,
  canEdit: boolean
): EditorState | null => {
  const { query } = useRouter();

  const [
    saving$,
    setSaving,
  ] = useBehaviorSubjectAndSetterFromCurrentValue<boolean>(false);
  const [status, setStatus] = useState<EditorStatus>(
    query[editModeQueryParamKey] === "true"
      ? EditorStatus.editingElement
      : EditorStatus.closed
  );

  const status$ = useBehaviorSubjectFromCurrentValue(status);

  const [message$, setMessage] = useBehaviorSubjectAndSetterFromCurrentValue<
    string | React.ReactElement | null
  >(null);
  const [
    previewElement$,
    setPreviewElement,
  ] = useBehaviorSubjectAndSetterFromCurrentValue<ElementToAdd | null>(null);

  const [transformMode, setTransformMode] = useState<
    "translate" | "rotate" | "scale" | null
  >(null);
  const [transformSnap, setTransformSnap] = useState(false);

  const [
    transformControls,
    setTransformControls,
  ] = useState<TransformControls | null>(null);

  const [isExitingTransform, setIsExitingTransform] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>("first person");

  const isClosed = status === EditorStatus.closed;

  // const isEditingTheme = status === EditorStatus.editingTheme;

  const [contentsTreeOpen, setContentsTreeOpen] = useState(false);

  const [selectedPeer, selectPeer] = useState<string | undefined>();
  const [hoveringPeers, setHoveringPeers] = useState<{
    peers: { [id: string]: boolean };
    hovered: string | undefined;
  }>();

  const setHoveringPeer = useCallback((peerId: string, hovering: boolean) => {
    setHoveringPeers((existing) => {
      const peers = {
        ...existing?.peers,
        [peerId]: hovering,
      };
      const hovered =
        Object.entries(peers).find(([, hovering]) => hovering) || null;

      const toHover = hovered ? hovered[0] : undefined;
      return {
        peers,
        hovered: toHover,
      };
    });
  }, []);

  const peerSelection: PeerSelection = {
    selectPeer,
    selectedPeer,
    hoveringPeer: hoveringPeers?.hovered,
    setPeerHovering: setHoveringPeer,
  };

  const {
    currentEditingElement,
    nestedForm,
    setCurrentEditingElementAndPath,
    currentEditingElementPath,
    undoInstance,
    elementIsSelected,
  } = useNestedElementFormAndSelectElement({ spaceId });

  const exitEditingElement = useCallback(() => {
    setCurrentEditingElementAndPath(null);
    setTransformMode(null);
    setCameraMode("first person");
    setContentsTreeOpen(false);
  }, [setCurrentEditingElementAndPath]);

  useEffect(() => {
    if (isClosed) {
      exitEditingElement();
    }
  }, [isClosed, exitEditingElement]);

  const settingsOpen = status === EditorStatus.editingSettings;

  const handleToggleOpenSettings = useCallback(() => {
    setStatus((existing) => {
      const shouldOpen = existing !== EditorStatus.editingSettings;

      if (shouldOpen) {
        exitEditingElement();
        return EditorStatus.editingSettings;
      }

      return EditorStatus.selectingElement;
    });
  }, [exitEditingElement, setStatus]);

  const editingUsersOpen = status === EditorStatus.editingUsers;

  const handleToggleOpenUsers = useCallback(() => {
    setStatus((existing) => {
      const shouldOpen = existing !== EditorStatus.editingUsers;

      if (shouldOpen) {
        exitEditingElement();
        return EditorStatus.editingUsers;
      }

      return EditorStatus.editingSettings;
    });
  }, [exitEditingElement, setStatus]);

  useEffect(() => {
    if (contentsTreeOpen) {
      if (!elementIsSelected) setStatus(EditorStatus.selectingElement);
      else setStatus(EditorStatus.editingElement);
    }
  }, [contentsTreeOpen, elementIsSelected, setStatus]);

  const spaceRoles = useSpaceRoles({ canEdit, spaceId });

  const [activeSections, setActiveSections] = useState<{
    [key: string]: boolean;
  }>({});

  const setActiveSection = useCallback((key: string, active: boolean) => {
    setActiveSections((existing) => ({
      ...existing,
      [key]: active,
    }));
  }, []);

  if (!canEdit || !spaceId) return null;

  return {
    status,
    status$,
    setStatus,
    previewElement$,
    setPreviewElement,
    transformControls,
    currentEditingElementPath,
    setCurrentEditingElementAndPath,
    currentEditingElement,
    saving$,
    setSaving,
    userHasEditPermission: canEdit === true,
    spaceId,
    message$,
    setMessage,
    undoInstance,
    setTransformControlsMode: setTransformMode,
    transformControlsMode: transformMode,
    setTransformControlsSnap: setTransformSnap,
    transformControlsSnap: transformSnap,
    isExitingTransform,
    setIsExitingTransform,
    elementIsSelected,
    setTransformControls,
    cameraMode,
    setCameraMode,
    nestedForm,
    isClosed,
    contentsTreeOpen,
    setContentsTreeOpen,
    settingsOpen,
    handleToggleOpenSettings,
    handleToggleOpenUsers,
    editingUsersOpen,
    spaceRoles,
    peerSelection,
    activeEditors: activeSections,
    setActiveEditor: setActiveSection,
  };
};
