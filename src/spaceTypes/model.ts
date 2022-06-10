import { InteractableElement } from "./interactable";
import { ShadowConfig } from "./shadow";
import { Color, FileLocation } from "./shared";

export interface PhongConfig {
  specularColor?: Color;
  shininess?: number;
  bumpMapScale?: number;
  reflectivity?: number;
  bumpMapTextureFile?: FileLocation;
  normalMapTextureFile?: FileLocation;
  displacementMapTextureFile?: FileLocation;
  displacementMapScale?: number;
}

export type MaterialConfig = {
  color?: Color;
  textureFile?: FileLocation;
  transparent?: boolean;
  opacity?: number;
  textureRepeatX?: number;
  textureRepeatY?: number;
} & (
  | {
      materialType: "lambert" | undefined;
      phong?: undefined;
    }
  | {
      materialType: "phong";
      phong?: PhongConfig;
    }
  | {
      materialType: "basic";
      phong?: undefined;
    }
);

export type BundledMaterialConfig =
  | {
      bundledMaterial: true;
      materialConfig: undefined;
    }
  | {
      bundledMaterial: false;
      materialConfig: MaterialConfig;
    };

export type ModelConfig = {
  modelFile?: FileLocation;
  isGround?: boolean;
  isCollidable?: boolean;
  shadow?: ShadowConfig;
  bundledMaterial: boolean;
  animated?: boolean;
  animationTimeScale?: number;
  envMapIntensity?: number;
  syncAnimation?: boolean;
  dontPreload?: boolean;
} & BundledMaterialConfig &
  InteractableElement;
