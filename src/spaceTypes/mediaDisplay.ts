import { ModelConfig } from "./model";
import {
  CurvedMediaGeometryConfig,
  MediaGeometryType,
  VideoPlaySettings,
  PlaySurfacesConfig,
} from "./video";

export type HasInSpaceQualityConfig = {
  inSpaceResolution?: number;
  inSpaceQuality?: number;
};

export type MediaGeometryConfig = {
  mediaGeometryType?: MediaGeometryType;
  mediaGeometryCurve?: CurvedMediaGeometryConfig;
  mediaGeometryModel?: ModelConfig | null;
  mediaPlaySurfaces?: PlaySurfacesConfig | null;
};

export type MediaDisplayConfig = {
  geometry?: MediaGeometryConfig;
};

export type HasPlaySettings = {
  playSettings?: VideoPlaySettings;
};
