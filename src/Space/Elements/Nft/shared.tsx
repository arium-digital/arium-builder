import { Color, MaterialConfig } from "spaceTypes";
import { FrameConfiguration } from "spaceTypes/image";
import { AnyDict } from "types";

export const textBackingPadding = 0.01;
// const color = "black";

// const boldWidth = 0.0015;

export interface BoxConfig {
  frame: FrameConfiguration;
  backingMaterial: MaterialConfig;
}

export interface Fonts {
  standard: AnyDict;
  bold: AnyDict;
}

// export const commonFontProps: {
//   font: string;
//   anchorX: "left";
//   anchorY: "top";
//   color: string;
//   depthOffset: -1;
// } = {
//   font: "Roboto",
//   anchorX: "left",
//   anchorY: "top",
//   color: color,
//   depthOffset: -1,
// };

// export const bold = {
//   outlineWidth: boldWidth,
//   outlineColor: color,
// };

// export const boldFont = {
//   ...bold,
//   ...commonFontProps,
// };

export type CommonProps = {
  visible?: boolean;
  fontSizes: FontSizes;
  fonts: Fonts;
  maxWidth: number;
  reflow: () => void;
};

export interface FontSizes {
  header: number;
  subHeader: number;
  body: number;
}

export const TextBackingBox = ({
  size: [width, height],
  color,
}: {
  size: [number, number];
  color: Color;
}) => {
  return (
    <mesh rotation-y={Math.PI * 2}>
      <planeBufferGeometry args={[width, height]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

export const sectionMargin = 0.05;
