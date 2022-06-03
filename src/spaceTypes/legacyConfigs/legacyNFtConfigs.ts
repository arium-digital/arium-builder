import {
  FileLocation,
  ModelConfig,
  PlaySettings,
  PositionalAudioConfig,
} from "spaceTypes";
import { InteractionConfig } from "spaceTypes/interactable";
import { HasBackingAndFrameConfig, HasFrameConfig } from "spaceTypes/text";
import {
  CurvedMediaGeometryConfig,
  MediaGeometryType,
  VideoThumbnailConfig,
} from "spaceTypes/video";
import { MediaType, NftType } from "../../../shared/nftTypes";

export type LegacyArtworkPlacardDisplayConfig = {
  fontSize?: number;
  primaryFontColor?: string;
  font?: string;
  showTitle?: boolean;
  showCreator?: boolean;
  showOwner?: boolean;
  showDescription?: boolean;
  showHistory?: boolean;
  showPrice?: boolean;
  width?: number;
  leftOffset?: number;
  bottomOffset?: number;
  titleVisibleDistance?: number;
  detailsVisibleDistance?: number;
} & HasBackingAndFrameConfig;

export type LegacyArtworkMediaDisplayConfig = {
  playSettings?: PlaySettings;
  positionalAudio?: PositionalAudioConfig;
  videoThumbnail?: VideoThumbnailConfig;
  mediaGeometryType?: MediaGeometryType;
  mediaGeometryCurve?: CurvedMediaGeometryConfig;
  mediaGeometryModel?: ModelConfig;
  inSpaceResolution?: number;
  inSpaceQuality?: number;
} & HasFrameConfig;

export type LegacyArtworkDisplayConfig = {
  showMedia?: boolean;
  mediaDisplay?: LegacyArtworkMediaDisplayConfig;
  showPlacard?: boolean;
  placardDisplay?: LegacyArtworkPlacardDisplayConfig;
};

export type LegacyNftConfig = {
  nftType: NftType;
  display?: LegacyArtworkDisplayConfig;
  description?: string | null;
  interactable?: boolean;
  interactableConfig?: InteractionConfig;
  override3dMediaFile?: FileLocation | null;
  override3dMediaFileType?: MediaType | null;
  offsetFromBack?: boolean;
};
