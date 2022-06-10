import {
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_IN_SPACE_IMAGE_QUALITY,
  DEFAULT_IN_SPACE_IMAGE_RESOLUTION,
} from "defaultConfigs";
import { InteractableElement } from "spaceTypes/interactable";
import { ModelConfig } from "spaceTypes/model";
import { FileLocation } from "spaceTypes/shared";
import { HasFrameConfig } from "spaceTypes/text";
import { CurvedMediaGeometryConfig, MediaGeometryType } from "spaceTypes/video";

type OptionalWidth = { width?: number };

type InSpaceQualityConfig = {
  inSpaceResolution?: number;
  inSpaceQuality?: number;
};

export const legacyDefaultImageConfig = (): ImageConfig => ({
  width: DEFAULT_IMAGE_WIDTH,
  // imageFile: defaultImageFile(),
  inSpaceResolution: DEFAULT_IN_SPACE_IMAGE_RESOLUTION,
  inSpaceQuality: DEFAULT_IN_SPACE_IMAGE_QUALITY,
});

/**
 * if width or height is specified
 * it ignores scale.
 * Yang
 * May 13, 2021
 */
export type ImageConfig = {
  legacyRotation?: boolean;
  imageFile?: FileLocation;
  imageShape?: {
    width: number;
    height: number;
  };
  transparent?: boolean;
  isAnimated?: boolean;
  mediaGeometryType?: MediaGeometryType;
  mediaGeometryModel?: ModelConfig;
  mediaGeometryCurve?: CurvedMediaGeometryConfig;
} & InteractableElement &
  OptionalWidth &
  HasFrameConfig &
  InSpaceQualityConfig;
