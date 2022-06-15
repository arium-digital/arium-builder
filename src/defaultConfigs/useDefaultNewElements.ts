import { DEFAULT_NFT_TYPE } from "defaultConfigs";
import { Concrete, mergeThemeAndDefault } from "hooks/spaceHooks";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { useCallback, useContext, useMemo } from "react";
import { ImageConfig, PositionalAudioConfig, VideoConfig } from "spaceTypes";
import { AudioConfig, AudioPlaySettings } from "spaceTypes/audio";
import {
  ElementType,
  ImageElementConfig,
  NftElementConfig,
  PlacardElementConfig,
  VideoElementConfig,
} from "spaceTypes/Element";
import { NftConfig } from "spaceTypes/nftConfig";
import { PlacardConfig, PLACARD_DATA_VERSION } from "spaceTypes/placard";
import { Theme } from "spaceTypes/theme";
import * as themeDefaults from "./theme";

export const baseDefaultImageConfig = (): ImageConfig => ({
  // imageFile: placeholderImageFile("Upload an Image"),
});

const defaultImageConfig = (theme: Theme): ImageConfig => ({
  ...baseDefaultImageConfig(),
  frame: mergeThemeAndDefault(themeDefaults.defaultFrame, theme),
  settings: mergeThemeAndDefault(themeDefaults.getDefaultImageSettings, theme),
});

export const baseDefaultVideoConfig = (): VideoConfig => ({
  type: "stored video",
  storedVideo: null,
});

export const defaultAudioPositionalAudioConfig = (): PositionalAudioConfig => ({
  mode: "spatial",
  volume: 100,
  distanceModel: "exponential",
  refDistance: 20,
  rollOffFactor: 3,
});

export const DEFAULT_AUDIO_MAX_DISTANCE = 200;

export const defaultAudioPlaySettings = (): Concrete<AudioPlaySettings> => ({
  syncToTimeline: true,
  maxDistance: DEFAULT_AUDIO_MAX_DISTANCE,
});

export const defaultAudioConfig = (): Concrete<
  Pick<AudioConfig, "playSettings" | "positionalAudio">
> => ({
  playSettings: defaultAudioPlaySettings(),
  positionalAudio: defaultAudioPositionalAudioConfig(),
});

const defaultVideoConfig = (theme: Theme): VideoConfig => ({
  ...baseDefaultVideoConfig(),
  frame: mergeThemeAndDefault(themeDefaults.defaultFrame, theme),
  settings: mergeThemeAndDefault(themeDefaults.videoSettings, theme),
});

export const baseDefaultPlacardConfig = (): PlacardConfig => ({
  version: PLACARD_DATA_VERSION,
  text: "",
  anchorX: "center",
  anchorY: "middle",
  textAlign: "left",
});

const defaultPlacardConfig = (theme: Theme): PlacardConfig => ({
  ...baseDefaultPlacardConfig(),
  display: mergeThemeAndDefault(themeDefaults.placardDisplay, theme),
});

export const baseDefaultNftConfig = (): NftConfig => ({
  nftType: DEFAULT_NFT_TYPE,
  // display: defaultArtworkDisplayConfig(),
  // superrareVersion: DEFAULT_SUPERRARE_VERSION,
  updateStatus: null,
  token: null,
  // superrareTokenHistory: null,
  description: null,
  tokenId: null,
  // interactable: null,
  // interactableConfig: null,
  override3dMediaFile: null,
  override3dMediaFileType: null,
  mediaFile: null,
});

const defaultNftConfig = (theme: Theme): NftConfig => ({
  ...baseDefaultNftConfig(),
  display: {
    mediaFrame: mergeThemeAndDefault(themeDefaults.defaultFrame, theme),
    video: mergeThemeAndDefault(themeDefaults.videoSettings, theme),
    image: mergeThemeAndDefault(themeDefaults.getDefaultImageSettings, theme),
    placardDisplay: mergeThemeAndDefault(themeDefaults.placardDisplay, theme),
  },
  interactable: true,
});

export const useDefaultThemedConfigs = () => {
  const theme$ = useContext(SpaceContext)?.theme$;
  const defaultTheme = useMemo(() => themeDefaults.defaultTheme(), []);
  const theme =
    useCurrentValueFromObservable(theme$, undefined) || defaultTheme;

  const image = useCallback(() => {
    return defaultImageConfig(theme);
  }, [theme]);

  const video = useCallback(() => {
    return defaultVideoConfig(theme);
  }, [theme]);

  const placard = useCallback(() => {
    return defaultPlacardConfig(theme);
  }, [theme]);

  const nft = useCallback(() => {
    return defaultNftConfig(theme);
  }, [theme]);

  return { image, video, placard, nft };
};

const useDefaultThemedElements = () => {
  const defaultConfigs = useDefaultThemedConfigs();
  const image = useCallback(() => {
    const image: ImageElementConfig = {
      name: ElementType.image,
      elementType: ElementType.image,
      active: true,
      image: defaultConfigs.image(),
    };

    return image;
  }, [defaultConfigs]);

  const video = useCallback(() => {
    const config: VideoElementConfig = {
      name: ElementType.video,
      elementType: ElementType.video,
      active: true,
      video: defaultConfigs.video(),
    };

    return config;
  }, [defaultConfigs]);

  const placard = useCallback(() => {
    const config: PlacardElementConfig = {
      name: ElementType.placard,
      elementType: ElementType.placard,
      active: true,
      placard: defaultConfigs.placard(),
    };

    return config;
  }, [defaultConfigs]);

  const nft = useCallback(() => {
    const config: NftElementConfig = {
      name: ElementType.nft,
      elementType: ElementType.nft,
      active: true,
      nft: defaultConfigs.nft(),
    };

    return config;
  }, [defaultConfigs]);

  return { image, video, placard, nft };
};

export default useDefaultThemedElements;
