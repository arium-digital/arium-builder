import { ElementConfig } from "spaceTypes";
import * as elementTypes from "spaceTypes/Element";

export const isModel = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.ModelElementConfig => {
  return elementConfig.elementType === elementTypes.ElementType.model;
};

export const isText = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.TextElementConfig => {
  return elementConfig.elementType === elementTypes.ElementType.text;
};

export const isPlacard = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.PlacardElementConfig => {
  return elementConfig.elementType === elementTypes.ElementType.placard;
};

export const isGroup = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.GroupElementConfig => {
  return elementConfig.elementType === elementTypes.ElementType.group;
};

export const isImage = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.ImageElementConfig => {
  return elementConfig.elementType === elementTypes.ElementType.image;
};

export const isLight = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.LightElementConfig => {
  return elementConfig.elementType === elementTypes.ElementType.light;
};

export const isVideo = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.VideoElementConfig => {
  return elementConfig.elementType === elementTypes.ElementType.video;
};

export const isAudio = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.AudioElementConfig => {
  return elementConfig.elementType === elementTypes.ElementType.audio;
};

export const isReflectorSurface = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.ReflectorSurfaceElementConfig => {
  return (
    elementConfig.elementType === elementTypes.ElementType.reflectorSurface
  );
};

export const isPortal = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.PortalElementConfig => {
  return elementConfig.elementType === elementTypes.ElementType.portal;
};

export const isTerrain = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.TerrainElementConfig => {
  return elementConfig.elementType === elementTypes.ElementType.terrain;
};

export const isNft = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.NftElementConfig => {
  return elementConfig.elementType === elementTypes.ElementType.nft;
};

export const isWater = (
  elementConfig: ElementConfig
): elementConfig is elementTypes.WaterElementConfig => {
  return elementConfig.elementType === elementTypes.ElementType.water;
};
