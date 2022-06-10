import { FrameConfiguration, OptionalWidth } from "spaceTypes/image";
import { InteractableElement } from "spaceTypes/interactable";
import { ModelConfig } from "spaceTypes//model";
import { FileLocation } from "spaceTypes/shared";
import {
  LiveStreamConfig,
  PlaySettings,
  PositionalAudioConfig,
} from "spaceTypes";
import {
  CurvedMediaGeometryConfig,
  LegacyStoredVideoFilesConfig,
  MediaGeometryType,
  PlaySurfacesConfig,
  VideoThumbnailConfig,
  VideoType,
} from "spaceTypes/video";
import {
  defaultPlaySettings,
  defaultSurfaceConfig,
  defaultVideoSoundConfig,
  DEFAULT_PLAY_SURFACES_TYPE,
  DEFAULT_VIDEO_WIDTH,
} from "defaultConfigs";

export type VideoConfig = {
  sound?: PositionalAudioConfig;
  legacyRotation?: boolean;
  playSettings?: PlaySettings;
  playSurfacesType?: MediaGeometryType;
  playSurfaces?: PlaySurfacesConfig;
  playSurfacesGeometry?: ModelConfig;
  playSurfacesGeometryCurve?: CurvedMediaGeometryConfig;
  thumbnailConfig?: VideoThumbnailConfig;
  hasFrame?: boolean;
  frameConfig?: FrameConfiguration;
  type: VideoType;
  storedVideos?: LegacyStoredVideoFilesConfig;
  storedVideo?: FileLocation;
  liveStream?: LiveStreamConfig;
} & InteractableElement &
  OptionalWidth;

export type LiveStreamVideoConfig = Pick<VideoConfig, "type" | "liveStream"> & {
  type: "stream";
};

export type StoredVideoConfig = Pick<
  VideoConfig,
  "type" | "storedVideo" | "storedVideos"
> & {
  type: "stored video";
};

export const legacyDefaultVideoConfig = (): VideoConfig => ({
  width: DEFAULT_VIDEO_WIDTH,
  type: "stored video",
  sound: defaultVideoSoundConfig(),
  playSettings: defaultPlaySettings(),
  playSurfacesType: DEFAULT_PLAY_SURFACES_TYPE,
  playSurfaces: {
    main: defaultSurfaceConfig(),
  },
});
