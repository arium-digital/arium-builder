import { AnimationClip, Group, Material } from "three";
import { ElementType, FileLocation } from "spaceTypes";
import { InteractionConfig, ShowModalConfig } from "spaceTypes/interactable";
import { ModelConfig } from "spaceTypes/model";

export enum InteractionEventType {
  MouseClick,
  PointerOver,
  PointerOut,
}

export type InteractionStatus = {
  pointerOver: boolean;
  clickCount: number;
};
export interface IModelInteractionProps {
  elementType?: ElementType;
  elementFile?: FileLocation;
  onModalOpen?: () => void;
  onModalClose?: () => void;
  interactionConfig: InteractionConfig;
}

export interface IModelHoverMaterial {
  model: Group;
  enabled: boolean;
}

export interface IModalWrapperProps {
  elementType?: ElementType;
  elementFile?: FileLocation;
  modalConfig: ShowModalConfig;
  show: boolean;
  onClose: () => void;
}

export type IModelContainerProps = {
  elementId: string;
  config: ModelConfig;
  handleLoaded?: (loaded: boolean) => void;
  disableCursorIntersectionDetection?: boolean;
};

export interface IModelAnimatorProps {
  model: Group;
  animations: AnimationClip[];
  timeScale: number | undefined;
  syncAcrossSessions: boolean | undefined;
}

export interface IModelMaterialOverrideProps {
  model: Group;
  material: Material;
}

export interface MediaSize {
  width: number | undefined;
  height: number | undefined;
}
