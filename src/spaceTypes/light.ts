import { IVector3, Color } from "./shared";

export enum LightKind {
  spot = "spot",
  directional = "directional",
  point = "point",
}

export interface ILightConfig {
  kind?: LightKind;
  color?: Color;
  intensity?: number;
  showHelper?: boolean;
  directional?: DirectionalLightSettings;
  spot?: SpotLightSettings;
  distance?: number;
  decay?: number;
}

export interface IDefaultLightConfig extends ILightConfig {
  // In DefaultConfig, those fields are always defined.
  showHelper: boolean;
  directional: DirectionalLightSettings;
  distance: number;
  decay: number;
}

export interface LightShadowConfig {
  mapSize: number;
  bias?: number;
  cameraSize?: number;
  cameraFar?: number;
}

export interface DirectionalLightSettings {
  position?: IVector3;
  target?: IVector3;
  castShadow?: boolean;
  shadowConfig?: LightShadowConfig;
}

export interface SpotLightSettings {
  distance?: number;
  angle: number;
  penumbra: number;
  decay: number;
}

export type BaseLightConfig = {
  color: Color;
  intensity: number;
  showHelper?: boolean;
};

export interface DirectionalLightConfig extends ILightConfig {
  kind: LightKind.directional;
  directional?: DirectionalLightSettings;
}

export interface SpotLightConfig extends ILightConfig {
  kind: LightKind.spot;
  directional?: DirectionalLightSettings;
  spot?: SpotLightSettings;
}

export interface PointLightConfig extends ILightConfig {
  kind: LightKind.point;
  distance: number;
  decay: number;
}

export type LightConfig =
  | DirectionalLightConfig
  | SpotLightConfig
  | PointLightConfig;
