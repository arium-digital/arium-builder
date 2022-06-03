// import { OpenSeaToken } from "./opensea";
import { FileLocation } from "../sharedTypes";
import { SuperrareToken, SuperrareContractVersion } from "./superrare";
import { TezosAccountMetadata, TezosTokenDetails } from "./tezos";

export type MediaType =
  | "video"
  | "image"
  | "gif"
  | "model"
  | "svg"
  | "application"
  | "audio"
  | "other";

export type NftType =
  | "ethereum"
  | "superrare"
  // deprecated: use ethereum instead
  | "opensea"
  | "tezos"
  | "manual entry";

export interface Web3Account {
  address: string;
  config?: string;
  profileImgUrl?: string | null;
  userName?: string | null;
}

export interface TokenMetadata {
  name?: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
}

export interface Token {
  metadata?: TokenMetadata;
  owner?: Web3Account;
  creator?: Web3Account;
  tokenId: string;
  tokenAddress?: string;
  openSeaLink?: string;
  externalLink?: string;
  collectionName?: string;
  tokenMetadata?: string | null | undefined;
}

export type NftUpdateStatus =
  | "updating"
  | "failed"
  | "success"
  | "awaitingInput";

export type HasNftBase = {
  nftType: NftType;
  tokenId?: string | null;
  tokenAddress?: string;
  token?: Token | null;
  updateStatus?: NftUpdateStatus | null;
  mediaFile?: FileLocation | null;
  mediaFileType?: string | null;
  fetchingMedia?: boolean;
};

export type SuperrareTokenHistory = Pick<
  SuperrareToken,
  | "events"
  | "nftEvents"
  | "editionNumber"
  | "totalEditions"
  | "currentPrice"
  | "auction"
>;

export type HasSuperrareNft = HasNftBase & {
  nftType: "superrare";
  superrareTokenHistory?: SuperrareTokenHistory | null;
  superrareVersion?: SuperrareContractVersion;
};

export type HasEthNft = HasNftBase & {
  nftType: "ethereum" | "opensea";
};

export type ManualEntryToken = {
  creatorName?: string;
  ownerName?: string;
  externalUrl?: string;
  collectionName?: string;
  videoFile?: FileLocation;
  imageFile?: FileLocation;
  imageShape?: {
    width: number;
    height: number;
  };
  mediaType?: MediaType;
  description?: string;
  name?: string;
};

export type HasTezosNft = HasNftBase & {
  nftType: "tezos";
  contractAlias?: string;
  contractAddress?: string;
  tezosToken?: TezosTokenDetails;
  tezosCreators?: TezosAccountMetadata[];
};

export type HasManualEntryNft = HasNftBase & {
  nftType: "manual entry";
  manualEntryToken?: ManualEntryToken;
};

export type HasNft =
  | HasEthNft
  | HasSuperrareNft
  | HasManualEntryNft
  | HasTezosNft;

export type BaseFetchTokenAndUpdateNftParams = {
  spaceId: string;
  elementId: string;
  tokenId: string;
};

export type FetchSuperrareTokenAndUpdateNftParams = BaseFetchTokenAndUpdateNftParams & {
  superrareVersion: SuperrareContractVersion;
  tokenAddress?: string | null;
  nftType: "superrare";
};

export type FetchOpenSeaTokenAndUpdateNftParams = BaseFetchTokenAndUpdateNftParams & {
  tokenAddress: string;
  nftType: "opensea";
};

export type FetchTezosTokenAndUpdateNftParams = BaseFetchTokenAndUpdateNftParams & {
  contractAddress: string;
  nftType: "tezos";
};

export type FetchTokenAndUpdateNftParams =
  | FetchSuperrareTokenAndUpdateNftParams
  | FetchOpenSeaTokenAndUpdateNftParams
  | FetchTezosTokenAndUpdateNftParams;

export type TezosTokenMediaParams = {
  nftType: "tezos";
  tezosToken: TezosTokenDetails | null | undefined;
};

export type EthTokenMediaParams = {
  nftType: "ethereum";
  token: Token | null | undefined;
};
export type TokenMediaParms = EthTokenMediaParams | TezosTokenMediaParams;

export type UpdateTokenMediaParams = {
  spaceId?: string;
  elementId?: string;
  tokenInfo: TokenMediaParms;
};
