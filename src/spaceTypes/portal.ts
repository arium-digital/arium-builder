import { IVector3 } from "./shared";

type toSpaceConfig =
  | {
      toAnotherSpace: true;
      specifyLandingPosition?: boolean;
      targetSpaceId?: string;
    }
  | {
      toAnotherSpace?: false;
      specifyLandingPosition?: boolean;
      targetSpaceId?: string;
    };

export type PortalConfig = toSpaceConfig & {
  showHelper?: boolean;
  targetPosition?: IVector3;
  targetLookAt?: IVector3;
  radius?: number;
  visible?: boolean;
  rotatedHalfPi?: boolean;
};

export const DEFAULT_PORTAL_RADIUS = 5;

export const defaultPortalConfig: () => PortalConfig = () => ({
  showHelper: false,
  visible: true,
  toAnotherSpace: true,
  radius: DEFAULT_PORTAL_RADIUS,
  targetPosition: {
    x: 0,
    y: 0,
    z: 0,
  },
  targetLookAt: {
    x: 0,
    y: 0,
    z: 0,
  },
});
