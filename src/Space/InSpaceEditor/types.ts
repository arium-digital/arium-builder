import { NestedFormPropWithUpdatedId } from "Editor/components/Form";
import { UndoInstance } from "Editor/hooks/useUndo";
import React, { Dispatch, SetStateAction } from "react";
import { Observable } from "rxjs";
import { ElementConfig } from "spaceTypes";
import { /*Camera,*/ Group, Object3D } from "three";
import { TransformControls } from "three-stdlib";
// import { TransformControls } from "three-stdlib";

import { Optional, Setter } from "types";
import { SpaceRoles } from "../../../shared/sharedTypes";

export type TransformControlMode = "translate" | "rotate" | "scale";
export type CameraMode = "first person" | "orbit";

export enum EditorStatus {
  closing,
  selectingElement,
  closed,
  editingElement,
  editingSettings,
  editingUsers,
  adding,
}

export type OptionalSpaceId = { spaceId?: string };
export type HasSpaceId = Required<OptionalSpaceId>;

type Message = string | React.ReactElement | null;
export type CurrentEditingElement = {
  // config: ElementConfig;
  group: Object3D;
};

export type ElementToAdd = {
  defaults: ElementConfig;
  toSave: Partial<ElementConfig> & Pick<ElementConfig, "elementType" | "name">;
};

export type CurrentEditingElementAndPath = {
  path: string[];
  initialValues: ElementConfig | undefined;
  element?: Optional<Object3D>;
};

export type PeerSelection = {
  selectPeer: (peerId: string | undefined) => void;
  selectedPeer: string | undefined;
  setPeerHovering: (peerId: string, hovering: boolean) => void;
  hoveringPeer: string | undefined;
};

export type EditorState = HasSpaceId & {
  message$: Observable<Message>;
  setMessage: Setter<Message>;
  saving$: Observable<boolean>;
  setSaving: Setter<boolean>;
  status: EditorStatus;
  status$: Observable<EditorStatus>;
  peerSelection: PeerSelection;
  setStatus: Setter<EditorStatus>;
  elementIsSelected: boolean;
  settingsOpen: boolean;
  handleToggleOpenSettings: () => void;
  handleToggleOpenUsers: () => void;
  editingUsersOpen: boolean;
  previewElement$: Observable<ElementToAdd | null>;
  setPreviewElement: Setter<ElementToAdd | null>;
  currentEditingElementPath: Optional<string[]>;
  currentEditingElement: Optional<Object3D>;
  setCurrentEditingElementAndPath: Dispatch<
    SetStateAction<Optional<CurrentEditingElementAndPath>>
  >;
  nestedForm: NestedFormPropWithUpdatedId<ElementConfig> | null;
  userHasEditPermission?: boolean;
  transformControlsMode: TransformControlMode | null;
  setTransformControlsMode: (mode: TransformControlMode | null) => void;
  setTransformControlsSnap: (snap: boolean) => void;
  transformControlsSnap: boolean;
  setTransformControls: (transformControls: TransformControls | null) => void;
  transformControls: TransformControls | null;
  isExitingTransform: boolean;
  setIsExitingTransform: Setter<boolean>;
  undoInstance: UndoInstance;
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
  isClosed: boolean;
  contentsTreeOpen: boolean;
  setContentsTreeOpen: Dispatch<SetStateAction<boolean>>;
  spaceRoles: SpaceRoles | undefined;
  activeEditors: {
    [key: string]: boolean;
  };
  setActiveEditor: (key: string, active: boolean) => void;
};

export type OptionalEditorState = {
  editorState: EditorState | null | undefined;
};

export type HasEditorState = {
  editorState: EditorState;
};

export type HasEnablePointerOverLayer$ = {
  enablePointerOverLayer$: Observable<boolean>;
  canInteract: boolean;
  canSelectToEdit: boolean;
};

export type OptionalElementGroup = {
  elementGroup: Group | null;
};

export type HasElementGroup = Required<OptionalElementGroup>;

export type WithTransformControlProps = {
  // elementConfig: ElementConfig;
  // elementPath: string[];
} & OptionalEditorState;

export type HasDisableInteractivity$ = {
  disableInteractivity$: Observable<boolean>;
};
