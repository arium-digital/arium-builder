import { Color, FileLocation, IVector3 } from "./shared";

export interface SpawnConfig {
  origin?: IVector3;
  lookAt?: IVector3;
  radius?: number;
}

export type ShadowMapType =
  | "BasicShadowMap"
  | "PCFShadowMap"
  | "PCFSoftShadowMap"
  | "VSMShadowMap";

export interface GraphicsConfig {
  shadowMapType?: ShadowMapType;
  antialias?: boolean;
}

export enum SkyBoxType {
  cubeMap = "Cube Map",
  HDRI = "HDRI",
  customSkyBox = "Custom Sky Box",
}
export interface CustomSkyBox {
  envMap?: FileLocation; // fallback to hdri preset if both are undefined
  enableEnvMapping?: boolean; // didn't reuse previous environmentMapping because that one is nested at different level
  useSkyBoxAsEnvMap?: boolean; // use skybox as envmap if this is true
  skyBox?: FileLocation; // use envMap as background if this is undefined
}

export interface EnvironmentConfig {
  skyBoxType?: SkyBoxType;
  skyBox?: FileLocation;
  HDRI?: FileLocation;
  customSkyBox?: CustomSkyBox;
  environmentMapping?: boolean;
  ambientLightIntensity: number;
  ambientLightColor?: Color;
  showGrid?: boolean;
  spawn?: SpawnConfig;
  defaultGraphics?: GraphicsConfig;
  enableFog?: boolean;
  fogColor?: Color;
  fogNear?: number;
  fogFar?: number;
}
