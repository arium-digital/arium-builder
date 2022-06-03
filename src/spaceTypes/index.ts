export interface BasicLightSettings {
  mainSunlightIntensity: number;
}
export type { SpaceMeta } from "../../shared/spaceMeta";
export type { EnvironmentConfig, SpawnConfig } from "./environment";
export type {
  Transform,
  Color,
  FileLocation,
  IVector3,
  IVector2,
} from "./shared";
export type { ScreenShareConfig, VideoAspect } from "./screenShare";

export { ElementType } from "./Element";

export type {
  BaseElementConfig,
  ElementConfig,
  PolyModelConfig,
} from "./Element";
export type {
  VideoConfig,
  LiveStreamConfig,
  LiveStreamVideoConfig,
  PlaySettings,
  VideoPlaySettings,
  PlaySurfaceConfig,
  PlaySurfacesConfig,
  Side,
  StoredVideoConfig,
  LegacyStoredVideoFilesConfig,
  PositionalAudioConfig,
} from "./video";
export type { TextConfig, TextParameters } from "./text";
export type {
  ModelConfig,
  BundledMaterialConfig,
  MaterialConfig,
  PhongConfig,
} from "./model";
export type { ImageConfig } from "./image";
export type { ShadowConfig } from "./shadow";
export type {
  LightConfig,
  BaseLightConfig,
  DirectionalLightConfig,
  DirectionalLightSettings,
  LightShadowConfig,
  SpotLightConfig,
  SpotLightSettings,
  PointLightConfig,
} from "./light";

export type {
  FlatShapeConfig,
  CircleConfig,
  RectangleConfig,
} from "./flatShape";

export type { BroadcastZoneConfig } from "./broadcastZone";
