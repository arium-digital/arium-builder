import { FlatShapeConfig } from "./flatShape";
import { PositionalAudioConfig } from "./video";

export type BroadcastZoneConfig = {
  shape?: FlatShapeConfig;
  visualize?: boolean;
  sound?: PositionalAudioConfig;
};
