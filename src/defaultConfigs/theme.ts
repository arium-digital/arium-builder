import {
  defaultCurvedMediaGeometryConfig,
  defaultFrameConfig,
  defaultHasFrameConfig,
  defaultPositionalAudioConfig,
  defaultVideoPlaySettings,
  defaultVideoThumbnailConfig,
} from "defaultConfigs";
import { Concrete, ConcreteAndChildrenConcrete } from "hooks/spaceHooks";
import { MaterialConfig } from "spaceTypes";
import { AvatarConfig } from "spaceTypes/AvatarConfig";
import { FrameConfiguration, ImageSettings } from "spaceTypes/image";
import {
  HasInSpaceQualityConfig,
  MediaGeometryConfig,
} from "spaceTypes/mediaDisplay";
import { NftPlacardSettings } from "spaceTypes/nftConfig";
import { PlacardDisplayConfig } from "spaceTypes/placard";
import { HasFrameConfig } from "spaceTypes/text";
import { GetThemeOrDefault, Theme } from "spaceTypes/theme";
import {
  VideoPlaySettings,
  VideoSettings,
  VideoThumbnailConfig,
} from "spaceTypes/video";

export const defaultAvatarConfig = (): Concrete<AvatarConfig> => ({
  avatarFile: {
    fileType: "external",
    url: "/models/defaultAvatar.glb",
  },
  selfViewPosition: null,
  selfViewRotation: null,
});

export const defaultAvatar: GetThemeOrDefault<AvatarConfig> = (
  theme: Theme
) => ({
  defaults: defaultAvatarConfig(),
  fromTheme: theme.defaultAvatar,
});

// export const defaultTheme = (): Theme => ({
//   artwork: defaultArtworkDisplayConfig(),
//   defaultAvatar: defaultAvatarConfig(),
// });

// export const artworkDisplay = (theme: Theme) =>
//   theme.artwork || defaultArtworkDisplayConfig();
const defaultMediaGeometryConfig = (): Concrete<MediaGeometryConfig> => ({
  mediaGeometryType: "plane",
  mediaGeometryModel: null,
  mediaGeometryCurve: defaultCurvedMediaGeometryConfig(),
  mediaPlaySurfaces: null,
});

const inSpaceQuality = (): Concrete<HasInSpaceQualityConfig> => ({
  inSpaceResolution: 1280,
  inSpaceQuality: 80,
});

const defaultPlacardBackingMaterial = (): MaterialConfig => ({
  color: "#fff",
  materialType: "basic",
});

const defaultPlacardFrameConfig = (): Concrete<FrameConfiguration> => ({
  ...defaultFrameConfig(),
  border: 0.025,
});

const defaultPlacardDisplayConfig = (): Concrete<PlacardDisplayConfig> => ({
  font: "Roboto",
  primaryFontColor: "#000",
  fontSize: 12,
  backingOffsetScale: 0.1,
  backingMaterial: defaultPlacardBackingMaterial(),
  frameConfig: defaultPlacardFrameConfig(),
  hasFrame: true,
  hasBacking: true,
  shadow: {
    cast: false,
    receive: false,
  },
});

const defaultNftPlacardSettings = (): Concrete<NftPlacardSettings> => ({
  showTitle: true,
  showCreator: true,
  showOwner: true,
  showDescription: true,
  showHistory: true,
  showPrice: false,
  leftOffset: 0.5,
  bottomOffset: 0.5,
  width: 1.25,
  titleVisibleDistance: 20,
  detailsVisibleDistance: 10,
});

const defaultVideoSettings = (): ConcreteAndChildrenConcrete<VideoSettings> => {
  return {
    ...inSpaceQuality(),
    geometry: defaultMediaGeometryConfig(),
    playSettings: defaultVideoPlaySettings(),
    positionalAudio: defaultPositionalAudioConfig(),
    videoThumbnail: defaultVideoThumbnailConfig(),
  };
};

export const defaultTheme = (): ConcreteAndChildrenConcrete<Theme> => ({
  version: null,
  defaultAvatar: defaultAvatarConfig(),
  frame: defaultHasFrameConfig(),
  image: defaultImageSettings(),
  nftPlacard: defaultNftPlacardSettings(),
  placardDisplay: defaultPlacardDisplayConfig(),
  video: defaultVideoSettings(),
});

export const nftPlacard: GetThemeOrDefault<NftPlacardSettings> = (
  theme: Theme
) => ({
  defaults: defaultTheme().nftPlacard,
  fromTheme: theme.nftPlacard,
});

export const placardDisplay: GetThemeOrDefault<PlacardDisplayConfig> = (
  theme: Theme
) => ({
  defaults: defaultTheme().placardDisplay,
  fromTheme: theme.placardDisplay,
});

export const videoSettings: GetThemeOrDefault<VideoSettings> = (
  theme: Theme
) => {
  return {
    defaults: defaultTheme().video,
    fromTheme: theme.video,
  };
};

const defaultImageSettings = (): ConcreteAndChildrenConcrete<ImageSettings> => ({
  ...inSpaceQuality(),
  geometry: defaultMediaGeometryConfig(),
});

export const getDefaultImageSettings: GetThemeOrDefault<ImageSettings> = (
  theme: Theme
) => {
  return {
    defaults: defaultTheme().image,
    fromTheme: theme.image,
  };
};

export const defaultFrame: GetThemeOrDefault<HasFrameConfig> = (
  theme: Theme
) => {
  return {
    defaults: defaultTheme().frame,
    fromTheme: theme.frame,
  };
};

export const playSettings: GetThemeOrDefault<VideoPlaySettings> = (
  theme: Theme
) => {
  return {
    defaults: defaultTheme().video.playSettings as Concrete<VideoPlaySettings>,
    fromTheme: theme.video?.playSettings,
  };
};

export const videoThumbnail: GetThemeOrDefault<VideoThumbnailConfig> = (
  theme: Theme
) => {
  return {
    defaults: defaultVideoSettings().videoThumbnail,
    fromTheme: theme.video?.videoThumbnail,
  };
};

export const imageInSpaceQuality: GetThemeOrDefault<HasInSpaceQualityConfig> = (
  theme: Theme
) => {
  return {
    defaults: defaultTheme().image,
    fromTheme: theme.image,
  };
};
