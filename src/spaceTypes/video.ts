import { Optional } from "types";
import { OptionalWidth } from "./image";
import { InteractableElement } from "./interactable";
import {
  HasInSpaceQualityConfig,
  HasPlaySettings,
  MediaDisplayConfig,
} from "./mediaDisplay";
import { FileLocation, IVector3 } from "./shared";
import { HasFrameConfig } from "./text";

export type Side = "Double Sided" | "Single Sided";

export interface PlaySurfaceConfig {
  cropTop?: number;
  cropBottom?: number;
  cropLeft?: number;
  cropRight?: number;
  position?: IVector3;
  rotation?: IVector3;
  scale?: number;
  transparent?: boolean;
  opacity?: number;
  side?: Side;
  isEquirectangular?: boolean;
}

export type LiveStreamConfig = {
  muxPlaybackId?: string;
};

export interface LegacyStoredVideoFilesConfig {
  webm?: FileLocation;
  mp4?: FileLocation;
}

export type AudioMode = "global" | "spatial";

export interface PositionalAudioConfig {
  volume?: number;
  refDistance?: number;
  rollOffFactor?: number;
  maxDistance?: number;
  mode?: AudioMode;
  distanceModel?: DistanceModelType;
}

export type PlaySettings = {
  syncToTimeline?: boolean;
  maxDistance?: number;
};

export type VideoPlaySettings = PlaySettings & {
  // startTime?: number;
  auto?: boolean;
  // playPlaneExtension?: number;
};

export type PlaySurfacesConfig = {
  [id: string]: PlaySurfaceConfig | null;
};

export interface VideoThumbnailConfig {
  time?: number;
  width?: number;
}

export type VideoType = "stored video" | "stream";
export type MediaGeometryType = "planes" | "3d geometry" | "curved" | "plane";

export type Orientation = "horizontal" | "vertical";

export type CurvedMediaGeometryConfig = {
  curveAngle?: number;
  orientation?: Orientation;
};

export type VideoSettings = MediaDisplayConfig & {
  // legacy config, left in for old times sake
  positionalAudio?: PositionalAudioConfig;
  videoThumbnail?: VideoThumbnailConfig;
} & HasPlaySettings &
  HasInSpaceQualityConfig;

export type VideoConfig = {
  storedVideos?: LegacyStoredVideoFilesConfig;
  storedVideo: Optional<FileLocation>;
  liveStream?: LiveStreamConfig;
  legacyRotation?: boolean;
  type: VideoType;
  videoShape?: {
    width: number;
    height: number;
  };
  version?: "0.2";
  settings?: VideoSettings;
  offsetFromBack?: boolean;
  frame?: HasFrameConfig;
} & OptionalWidth &
  InteractableElement;

export type LiveStreamVideoConfig = Pick<VideoConfig, "type" | "liveStream"> & {
  type: "stream";
};

export type StoredVideoConfig = Pick<
  VideoConfig,
  "type" | "storedVideo" | "storedVideos"
> & {
  type: "stored video";
};
