import { FrameConfiguration } from "./image";
import { MaterialConfig } from "./model";
import { ShadowConfig } from "./shadow";
import { Color } from "./shared";
import { PlacardConfig } from "./placard";

export interface TextParameters {
  curveSegments?: number;
  bevelEnabled?: boolean;
  bevelThickness?: number;
  bevelSize?: number;
  bevelOffset?: number;
  bevelSegments?: number;
}

export type TextConfigBase = {
  text: string;
  font?: string;
  frontColor?: Color;
  size?: number;
  shadow?: ShadowConfig;
};

export type HasFrameConfig = {
  hasFrame?: boolean;
  frameConfig?: FrameConfiguration;
};

export type HasBackingAndFrameConfig = {
  hasBacking?: boolean;
  backingOffsetScale?: number;
  backingMaterial?: MaterialConfig;
} & HasFrameConfig;

export interface TextConfig extends TextConfigBase {
  sideColor?: Color;
  height?: number;
  textGeometry?: TextParameters;
  legacyFontScale?: number;
}

export type { PlacardConfig };
