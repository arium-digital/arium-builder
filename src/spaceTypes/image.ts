import { InteractableElement } from "./interactable";
import { HasInSpaceQualityConfig, MediaGeometryConfig } from "./mediaDisplay";
import { MaterialConfig } from "./model";
import { FileLocation } from "./shared";
import { HasFrameConfig } from "./text";

export type FrameConfiguration = {
  depth?: number;
  border?: number;
  material?: MaterialConfig;
};
export type OptionalWidth = { width?: number };
export type HasWidth = Required<OptionalWidth>;
export type OptionalWidthHeight = OptionalWidth & { height?: number };
export type HasWidthHeight = Required<OptionalWidthHeight>;

export type ImageConfig = {
  version?: string;
  legacyRotation?: boolean;
  imageFile?: FileLocation;
  imageShape?: {
    width: number;
    height: number;
  };
  transparent?: boolean;
  isAnimated?: boolean;
  offsetFromBack?: boolean;
  settings?: ImageSettings;
  frame?: HasFrameConfig;
} & InteractableElement &
  OptionalWidth;

export type ImageSettings = {
  geometry?: MediaGeometryConfig;
} & HasInSpaceQualityConfig;
