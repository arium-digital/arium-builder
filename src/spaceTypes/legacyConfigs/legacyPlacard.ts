import { FrameConfiguration } from "spaceTypes/image";
import { MaterialConfig } from "spaceTypes/model";
import { ShadowConfig } from "spaceTypes/shadow";
import { InteractableElement } from "spaceTypes/interactable";
import { Color } from "spaceTypes/shared";

type TextConfigBase = {
  text: string;
  font?: string;
  frontColor?: Color;
  size?: number;
  shadow?: ShadowConfig;
};

type HasFrameConfig = {
  hasFrame?: boolean;
  frameConfig?: FrameConfiguration;
};

type HasBackingAndFrameConfig = {
  hasBacking?: boolean;
  backingOffsetScale?: number;
  backingMaterial?: MaterialConfig;
} & HasFrameConfig;

export type LegacyPlacardConfig = TextConfigBase & {
  maxWidth?: number;
  hasBacking?: boolean;
  anchorX?: "left" | "center" | "right";
  anchorY?: "top" | "top-baseline" | "middle" | "bottom-baseline" | "bottom";
  textAlign?: "left" | "right" | "center" | "justify";
  offsetFromBack?: boolean;
} & HasBackingAndFrameConfig &
  InteractableElement;
