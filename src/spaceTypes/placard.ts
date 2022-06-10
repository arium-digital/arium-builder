import { InteractableElement } from "./interactable";
import { ShadowConfig } from "./shadow";
import { Color } from "./shared";
import { HasBackingAndFrameConfig } from "./text";

export type PlacardDisplayConfig = {
  font?: string;
  primaryFontColor?: Color;
  fontSize?: number;
  shadow?: ShadowConfig;
} & HasBackingAndFrameConfig;

export const PLACARD_DATA_VERSION = "0.2";

export type PlacardConfig = {
  version?: string;
  text: string;
  maxWidth?: number;
  anchorX?: "left" | "center" | "right";
  anchorY?: "top" | "top-baseline" | "middle" | "bottom-baseline" | "bottom";
  textAlign?: "left" | "right" | "center" | "justify";
  offsetFromBack?: boolean;
  display?: PlacardDisplayConfig;
} & InteractableElement;
