import { MediaType } from "Space/Elements/Nft/lib";
import { FileLocation } from "spaceTypes";
import {
  HasEthNft,
  HasManualEntryNft,
  HasSuperrareNft,
  HasTezosNft,
  NftType,
} from "../../shared/nftTypes";
import { ImageSettings } from "./image";
import { InteractionConfig } from "./interactable";
import { PlacardDisplayConfig } from "./placard";
import { HasFrameConfig } from "./text";
import { VideoSettings } from "./video";

export type NftPlacardSettings = {
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
};

export type ArtworkDisplayConfig = {
  showMedia?: boolean;
  showPlacard?: boolean;
  placardDisplay?: PlacardDisplayConfig;
  nftPlacardSettings?: NftPlacardSettings;
  video?: VideoSettings;
  image?: ImageSettings;
  mediaFrame?: HasFrameConfig;
};

export type BaseNftConfig = {
  version?: string;
  nftType: NftType;
  display?: ArtworkDisplayConfig;
  fetchPricing?: boolean;
  description?: string | null;
  overrideCreator?: string | null;
  interactable?: boolean;
  interactableConfig?: InteractionConfig;
  overrideNftLink?: boolean;
  overrideNftLinkUrl?: string;
  overrideNftLinkText?: string;
  shouldOverride3dMediaFile?: boolean;
  override3dMediaFile?: FileLocation | null;
  override3dMediaFileType?: MediaType | null;
  offsetFromBack?: boolean;
};

export type SuperrareNftConfig = BaseNftConfig & HasSuperrareNft;

export type EthNftConfig = BaseNftConfig & HasEthNft;
export type TezosNftConfig = BaseNftConfig & HasTezosNft;

export type ManualEntryNftConfig = BaseNftConfig & HasManualEntryNft;

export type NftConfig =
  | SuperrareNftConfig
  | EthNftConfig
  | TezosNftConfig
  | ManualEntryNftConfig;
