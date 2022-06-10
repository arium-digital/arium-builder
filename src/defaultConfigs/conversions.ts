import { ElementType, ImageConfig, VideoConfig } from "spaceTypes";
import {
  ImageConfig as LegacyImageConfig,
  legacyDefaultImageConfig,
} from "spaceTypes/legacyConfigs/legacyImage";
import { VideoSettings } from "spaceTypes/video";
import {
  legacyDefaultVideoConfig,
  VideoConfig as LegacyVideoConfig,
} from "spaceTypes/legacyConfigs/legacyVideo";
import { LegacyNftConfig } from "spaceTypes/legacyConfigs/legacyNFtConfigs";
import { HasFrameConfig } from "spaceTypes/text";
import { ImageSettings } from "spaceTypes/image";
import { ArtworkDisplayConfig } from "spaceTypes/nftConfig";
import { PlacardDisplayConfig, PLACARD_DATA_VERSION } from "spaceTypes/placard";
import { MediaGeometryConfig } from "spaceTypes/mediaDisplay";
import { Theme } from "spaceTypes/theme";
import { LegacyTheme } from "spaceTypes/legacyConfigs/legacyTheme";
import { store } from "db";
import { legacyPlacardConfig } from "spaceTypes/legacyConfigs/legacyDefaultPlacardConfig";
import { LegacyPlacardConfig } from "spaceTypes/legacyConfigs/legacyPlacard";
import merge from "lodash/merge";
import {
  ImageElementConfig,
  NftElementConfig,
  PlacardElementConfig,
  VideoElementConfig,
} from "spaceTypes/Element";
import { isUndefined, omitBy } from "lodash";

export const legacyVideoConverter = (
  legacyConfig: LegacyVideoConfig
): Partial<VideoConfig> | undefined => {
  if (!legacyConfig) return undefined;
  const legacyDefaults = legacyDefaultVideoConfig();

  const legacyWithDefaults = merge({}, legacyDefaults, legacyConfig);

  const settingsFromLegacy: VideoSettings = purgeUndefined({
    geometry: purgeUndefined({
      mediaGeometryModel: legacyConfig?.playSurfacesGeometry,
      mediaGeometryType: legacyConfig?.playSurfacesType,
      mediaGeometryCurve: legacyConfig?.playSurfacesGeometryCurve,
      mediaPlaySurfaces: legacyConfig?.playSurfaces,
    }),
    playSettings: purgeUndefined(legacyWithDefaults.playSettings),
    positionalAudio: purgeUndefined(legacyWithDefaults.sound),
    videoThumbnail: purgeUndefined(legacyWithDefaults.thumbnailConfig),
  });

  const frame: HasFrameConfig = {
    frameConfig: legacyWithDefaults.frameConfig || {},
    hasFrame: !!legacyWithDefaults.hasFrame,
  };

  const result: Partial<VideoConfig> = {
    settings: settingsFromLegacy,
    frame,
  };

  return result;
};

export const legacyImageConverter = (
  config: LegacyImageConfig
): Pick<ImageConfig, "frame" | "settings"> | undefined => {
  if (!config) return undefined;
  const legacyConfig = config as LegacyImageConfig;

  const legacyWithDefaults = merge({}, legacyDefaultImageConfig, legacyConfig);
  const legacyGeometry: MediaGeometryConfig | undefined = purgeUndefined({
    mediaGeometryModel: legacyConfig?.mediaGeometryModel,
    mediaGeometryType: legacyConfig?.mediaGeometryType,
    mediaGeometryCurve: legacyConfig?.mediaGeometryCurve,
  });
  const valuesFromLegacy: ImageSettings = purgeUndefined({
    geometry: legacyGeometry,
    inSpaceResolution: legacyConfig?.inSpaceResolution,
    inSpaceQuality: legacyConfig?.inSpaceQuality,
  });

  const frame: HasFrameConfig = {
    frameConfig: legacyWithDefaults?.frameConfig || {},
    hasFrame: !!legacyWithDefaults?.hasFrame,
  };

  const result: Pick<ImageConfig, "frame" | "settings"> = {
    frame,
    settings: valuesFromLegacy,
  };

  return result;
};

function legacyNftConverter(nft: LegacyNftConfig | undefined) {
  const legacyDisplay = nft?.display;

  if (!legacyDisplay) {
    // console.log('no display settings')
    return undefined;
  }

  // console.log('getting display settings');

  const mediaGeometry: MediaGeometryConfig = purgeUndefined({
    mediaGeometryCurve: legacyDisplay.mediaDisplay?.mediaGeometryCurve,
    mediaGeometryModel: legacyDisplay.mediaDisplay?.mediaGeometryModel,
    mediaGeometryType: legacyDisplay.mediaDisplay?.mediaGeometryType,
  });

  const imageSettings: ImageSettings = purgeUndefined({
    inSpaceQuality: legacyDisplay?.mediaDisplay?.inSpaceQuality,
    inSpaceResolution: legacyDisplay?.mediaDisplay?.inSpaceResolution,
    geometry: purgeUndefined(mediaGeometry),
  });

  const videoSettings: VideoSettings = purgeUndefined({
    geometry: purgeUndefined(mediaGeometry),
  });

  const result: ArtworkDisplayConfig = {
    image: imageSettings,
    video: videoSettings,
  };

  return result;
}

function purgeUndefined<T>(values: T): Partial<T> {
  // @ts-ignore
  return omitBy(values, isUndefined);
}

export async function migrateNfts() {
  const elementsTree = store
    .collectionGroup("elementsTree")
    .where("elementType", "==", ElementType.nft);

  const elements = await elementsTree.get();

  elements.forEach(async (elementDoc) => {
    const element = elementDoc.data() as NftElementConfig;
    if (!element.deleted && !element.nft?.version) {
      const updated = legacyNftConverter(element.nft as LegacyNftConfig);

      if (updated) {
        console.log("upating:", updated);
        await elementDoc.ref.update({
          "nft.version": "0.2",
          "nft.display.image": purgeUndefined(updated.image) || null,
          "nft.display.video": purgeUndefined(updated.video) || null,
        });
      }
    }
  });

  console.log("done");
}

export async function migrateVideos() {
  const elementsTree = store
    .collectionGroup("elementsTree")
    .where("elementType", "==", ElementType.video);

  const elements = await elementsTree.get();

  elements.forEach(async (elementDoc) => {
    const element = elementDoc.data() as VideoElementConfig;
    if (!element.deleted && !element.video?.version) {
      const updated = legacyVideoConverter(element.video as LegacyVideoConfig);

      console.log("upating:", updated);

      if (updated)
        await elementDoc.ref.update({
          "video.version": "0.2",
          "video.frame": updated.frame,
          "video.settings": updated.settings,
        });
    }
  });
}

export async function migrateImages() {
  const elementsTree = store
    .collectionGroup("elementsTree")
    .where("elementType", "==", ElementType.image);

  const elements = await elementsTree.get();

  elements.forEach(async (elementDoc) => {
    const element = elementDoc.data() as ImageElementConfig;
    if (!element.deleted && !element.image?.version) {
      const updated = legacyImageConverter(element.image as LegacyImageConfig);

      // if (element.name === 'logo novo')
      console.log("upating:", updated);

      if (updated)
        await elementDoc.ref.update({
          "image.version": "0.2",
          "image.frame": updated.frame,
          "image.settings": updated.settings,
        });
    }
  });
}

export async function migrateAndApplyDefaultsToPlacards() {
  const elementsTree = store
    .collectionGroup("elementsTree")
    .where("elementType", "==", ElementType.placard);

  const existingDefaultPlacard = legacyPlacardConfig();

  const existingDefaultDisplay: PlacardDisplayConfig = {
    font: existingDefaultPlacard.font,
    hasBacking: !!existingDefaultPlacard.hasBacking,
    backingOffsetScale: existingDefaultPlacard.backingOffsetScale,
    primaryFontColor: existingDefaultPlacard.frontColor,
    fontSize: existingDefaultPlacard.size,
    hasFrame: !!existingDefaultPlacard.hasFrame,
  };

  const generateDisplay = (
    config: LegacyPlacardConfig | undefined
  ): PlacardDisplayConfig => {
    const settingsFromNew: PlacardDisplayConfig | undefined = config
      ? {
          font: config.font,
          backingMaterial: config.backingMaterial,
          backingOffsetScale: config.backingOffsetScale,
          fontSize: config.size,
          frameConfig: config.frameConfig,
          hasFrame: !!config.hasFrame,
          hasBacking: !!config.hasBacking,
          primaryFontColor: config.frontColor,
          shadow: config.shadow,
        }
      : undefined;

    const result: PlacardDisplayConfig = merge(
      {},
      purgeUndefined(existingDefaultDisplay),
      purgeUndefined(settingsFromNew) || {}
    );

    return result;
  };

  const elements = await elementsTree.get();

  elements.forEach(async (element) => {
    const placardElement = element.data() as PlacardElementConfig;
    if (!placardElement.deleted && !placardElement.placard?.version) {
      const newDisplay = generateDisplay(placardElement.placard);

      // if (placardElement.name === 'title 2')
      console.log("upating:", {
        name: placardElement.name,
        display: newDisplay,
      });

      await element.ref.update({
        "placard.display": newDisplay,
        "placard.version": PLACARD_DATA_VERSION,
      });
    }
  });
}

export function legacyThemeConverter(
  legacyTheme: LegacyTheme | undefined | null
): Partial<Theme> | undefined | null {
  if (!legacyTheme) return undefined;

  const legacyFrame: HasFrameConfig = {
    hasFrame: !!legacyTheme.artwork?.mediaDisplay?.hasFrame,
    frameConfig: legacyTheme.artwork?.mediaDisplay?.frameConfig || {},
  };

  const result: Pick<Theme, "frame" | "placardDisplay"> = purgeUndefined({
    frame: legacyFrame,
    placardDisplay: purgeUndefined({
      ...(legacyTheme.artwork?.placardDisplay || {}),
    }),
  });

  return result;
}

export async function migrateTheme() {
  const settings = await store.collectionGroup("settings").get();

  settings.forEach(async (settingDoc) => {
    if (settingDoc.id === "theme") {
      const legacyTheme = settingDoc.data() as Theme;
      if (!legacyTheme.version) {
        const updated = legacyThemeConverter(legacyTheme);

        console.log("upating:", updated);

        if (updated)
          await settingDoc.ref.update({
            version: "0.2",
            frame: updated.frame,
            placardDisplay: updated.placardDisplay,
          });
      }
      // if (!element.deleted /*&& !element.image?.version*/) {
    }
  });
}
