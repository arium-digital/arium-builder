import { FrameConfiguration } from "./image";

// you can play around with the parameters here
// https://codesandbox.io/s/drei-reflector-forked-4y54p?file=/src/App.js

export type ReflectorConfig = {
  resolution: number; // max 1024 for performance
  mixBlur: number; // mixBlur and resolution ca
  mixStrength: number; // add brightness, 0 - infinite. but 10 seems like a nice upper cap
  mirror: number; // 0 - 1
};

export type ReflectorMaterialConfig = {
  roughnessMap?: string;
  roughness: number;
  metalness: number;
  color: string;
  transparent?: boolean;
  opacity?: number;
};

export type ReflectorSurfaceConfig = {
  legacyRotation?: boolean;
  hasFrame: boolean;
  frameConfig: FrameConfiguration;
  doubleSided: boolean;
  width: number;
  height: number;
  reflectorConfig: ReflectorConfig;
  materialConfig: ReflectorMaterialConfig;
  isGround?: boolean;
  isCollidable?: boolean;
};

export const defaultReflectorMaterialConfig = (): ReflectorMaterialConfig => ({
  roughness: 1,
  metalness: 0,
  color: "#a0a0a0",
  transparent: false,
  opacity: 1,
});

export const defaultReflectorConfig = (): ReflectorConfig => ({
  resolution: 1024,
  mixBlur: 0,
  mixStrength: 4,
  mirror: 0.8,
});

export const defaultReflectorSurfaceConfig = (): ReflectorSurfaceConfig => ({
  // clear mirror setting
  hasFrame: false,
  doubleSided: true,
  width: 4,
  height: 4,
  frameConfig: {
    depth: 0.01,
    border: 0.1,
  },
  reflectorConfig: defaultReflectorConfig(),
  materialConfig: defaultReflectorMaterialConfig(),
});
