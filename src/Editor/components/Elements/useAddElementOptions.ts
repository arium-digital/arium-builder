import { useMemo } from "react";

import {
  placeholderImageFile,
  defaultModelElement,
  defaultTerrainElement,
  defaultPortalElement,
  defaultLightElement,
  defaultGroupElement,
  defaultScreenshareElement,
  defaultAudioElement,
} from "defaultConfigs";
import { ElementType, MaterialConfig } from "spaceTypes";
import {
  AudioElementConfig,
  ElementConfig,
  GroupElementConfig,
  ImageElementConfig,
  LightElementConfig,
  ModelElementConfig,
  NftElementConfig,
  PlacardElementConfig,
  PortalElementConfig,
  TerrainElementConfig,
  VideoElementConfig,
} from "spaceTypes/Element";
import { TerrainConfig } from "spaceTypes/terrain";
import { LightKind } from "spaceTypes/light";
import { PLACARD_DATA_VERSION } from "spaceTypes/placard";
import useDefaultNewThemedElements from "defaultConfigs/useDefaultNewElements";

const newNftConfig = (): Partial<NftElementConfig> => ({
  nft: {
    // @ts-ignore
    nftType: "ethereum",
    version: "0.2",
    token: {
      tokenId: "",
      metadata: {
        fileType: "image/png",
        name: "Nft",
        description: "...awaiting token info entry",
      },
    },
    updateStatus: "awaitingInput",
    offsetFromBack: true,
    mediaFile: placeholderImageFile("Nft"),
  },
});

const newTerrainConfig = (): Partial<TerrainElementConfig> => {
  const defaultMaterialConfig: MaterialConfig = {
    materialType: "phong",
    phong: {},
    textureRepeatX: 10,
    textureRepeatY: 10,
    textureFile: {
      fileLocation: "standardAssets",
      folder: "textures/sand_01",
      fileName: "sand_01_diff_1k.jpg",
      fileType: "stored",
    },
  };
  const result: TerrainConfig = {
    isGround: true,
    materialConfig: defaultMaterialConfig,
    width: 20,
    height: 20,
    widthSegments: 64,
    heightSegments: 64,
    minHeight: 0,
    maxHeight: 4,
    heightMapFile: {
      fileLocation: "standardAssets",
      folder: "terrainMaps",
      fileType: "stored",
      fileName: "heightmapdemo.png",
    },
  };

  return {
    terrain: result,
  };
};

const newPlacardConfig = (): Partial<PlacardElementConfig> => ({
  placard: {
    version: PLACARD_DATA_VERSION,
    text: "Placeholder for new placard text",
    offsetFromBack: true,
  },
});

const newPortalConfig = (): Partial<PortalElementConfig> => ({
  portal: {
    radius: 2,
    toAnotherSpace: false,
    rotatedHalfPi: true,
  },
});

const newLightConfig = (): Partial<LightElementConfig> => ({
  light: {
    kind: LightKind.spot,
  },
});

const newImageConfig = (): Partial<ImageElementConfig> => ({
  image: {
    version: "0.2",
    offsetFromBack: true,
  },
});

const newVideoConfig = (): Partial<VideoElementConfig> => ({
  video: {
    version: "0.2",
    offsetFromBack: true,
    type: "stored video",
    storedVideo: null,
  },
});

const newAudioConfig = (): Partial<AudioElementConfig> => ({});

const newModelConfig = (): Partial<ModelElementConfig> => ({
  model: {
    // @ts-ignore
    bundledMaterial: true,
  },
});

const newGroupConfig = (): Partial<GroupElementConfig> => ({});

export type AddElementConfig = {
  elementType: ElementType;
  toolTip: string;
  defaultElementConfig: () => ElementConfig;
  newElementConfig: () => Partial<ElementConfig>;
};

const useAddElementOptions = () => {
  const defaultThemedElements = useDefaultNewThemedElements();

  const addButtonConfigs: AddElementConfig[] = useMemo(
    () => [
      {
        elementType: ElementType.nft,
        toolTip: "Add an Nft",
        defaultElementConfig: defaultThemedElements.nft,
        newElementConfig: newNftConfig,
      },
      {
        elementType: ElementType.image,
        toolTip: "Add an Image",
        defaultElementConfig: defaultThemedElements.image,
        newElementConfig: newImageConfig,
      },
      {
        elementType: ElementType.video,
        toolTip: "Add a Video",
        defaultElementConfig: defaultThemedElements.video,
        newElementConfig: newVideoConfig,
      },
      {
        elementType: ElementType.audio,
        toolTip: "Add Background Audio/Music",
        defaultElementConfig: defaultAudioElement,
        newElementConfig: newAudioConfig,
      },
      {
        elementType: ElementType.placard,
        toolTip: "Add a Placard",
        defaultElementConfig: defaultThemedElements.placard,
        newElementConfig: newPlacardConfig,
      },
      {
        elementType: ElementType.model,
        toolTip: "Add a Model",
        defaultElementConfig: defaultModelElement,
        newElementConfig: newModelConfig,
      },
      {
        elementType: ElementType.terrain,
        toolTip: "Add Terrain",
        defaultElementConfig: defaultTerrainElement,
        newElementConfig: newTerrainConfig,
      },
      {
        elementType: ElementType.portal,
        toolTip: "Add a Portal",
        defaultElementConfig: defaultPortalElement,
        newElementConfig: newPortalConfig,
      },
      {
        elementType: ElementType.light,
        toolTip: "Add a Light",
        defaultElementConfig: defaultLightElement,
        newElementConfig: newLightConfig,
      },
      {
        elementType: ElementType.screenShare,
        toolTip: "Add a Screenshare",
        defaultElementConfig: defaultScreenshareElement,
        newElementConfig: defaultScreenshareElement,
      },
      {
        elementType: ElementType.group,
        toolTip: "Add a Group",
        defaultElementConfig: defaultGroupElement,
        newElementConfig: newGroupConfig,
      },
    ],
    [defaultThemedElements]
  );

  return addButtonConfigs;
};

export default useAddElementOptions;
