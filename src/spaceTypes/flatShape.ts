export type RectangleConfig = {
  width?: number;
  height?: number;
};

export type CircleConfig = {
  radius?: number;
  segments?: number;
  thetaStart?: number;
  thetaEnd?: number;
};

export type FlatShapeConfig = {} & (
  | {
      kind: "rectangle";
      rectangle?: RectangleConfig;
      circle?: undefined;
    }
  | {
      kind: "circle";
      circle?: CircleConfig;
      rectangle?: undefined;
    }
);
