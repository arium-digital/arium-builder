import { Concrete } from "hooks/spaceHooks";
import { FileLocation } from "spaceTypes";
import { Water2Options } from "three-stdlib";

export type WaterSurfacesType = "plane" | "3d geometry";

export type WaterConfig = Pick<
  Water2Options,
  "color" | "flowSpeed" | "reflectivity" | "scale"
> & {
  width: number;
  height: number;
  isGround?: boolean;
  resolution?: 512 | 256 | 128;
  surfaceType?: WaterSurfacesType;
  surfaceGeometryFile?: FileLocation | null;
};

export const DEFAULT_WATER_RESOLUTION = 512;

export const defaultWaterConfig = (): Concrete<WaterConfig> => ({
  width: 1,
  height: 1,
  color: "white",
  reflectivity: 0.3,
  flowSpeed: 0.01,
  scale: 0.5,
  resolution: DEFAULT_WATER_RESOLUTION,
  isGround: true,
  surfaceType: "plane",
  surfaceGeometryFile: null,
});
