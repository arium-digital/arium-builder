import { FileLocation } from "../../shared/sharedTypes";
import { MaterialConfig } from "./model";

export type Easing =
  | "Linear"
  | "EaseIn"
  | "EaseInWeak"
  | "EaseOut"
  | "EaseInOut"
  | "InEaseOut";

export interface TerrainConfig {
  heightMapFile?: FileLocation;
  maxHeight?: number;
  minHeight?: number;
  width?: number;
  height?: number; // steps: 0,
  easing?: Easing;
  widthSegments?: number;
  heightSegments?: number;
  materialConfig?: MaterialConfig;
  isGround?: boolean;
}
