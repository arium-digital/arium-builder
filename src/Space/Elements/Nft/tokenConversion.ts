import { useMemo } from "react";
import { NftConfig } from "spaceTypes/nftConfig";

import { ManualEntryToken } from "../../../../shared/nftTypes";
import {
  EthNftConfig,
  ManualEntryNftConfig,
  SuperrareNftConfig,
  TezosNftConfig,
} from "spaceTypes/nftConfig";
import { HasNft, MediaType } from "../../../../shared/nftTypes";

import { FileLocation } from "spaceTypes";
import { parseTezosTokenMetadata } from "./tezos/parseTezosToken";

export interface TokenTextInfo {
  name?: string;
  description?: string;
  creatorName?: string;
  ownerName?: string;
  collectionName?: string;
  externalLink?: string;
}

export type TokenMedia = {
  originalMediaFile: FileLocation | undefined;
  inSpaceMediaFile: FileLocation | undefined;
  inSpaceMediaFileType?: MediaType | undefined;
  originalMediaFileType: MediaType | undefined;
};

export const getMediaType = (mimeType: string): MediaType => {
  if (mimeType.includes("video")) return "video";

  if (
    mimeType.includes("png") ||
    mimeType.includes("jpg") ||
    mimeType.includes("jpeg")
  )
    return "image";

  if (mimeType.includes("gif")) return "gif";

  if (mimeType.includes("video")) return "video";

  if (mimeType.includes("gltf") || mimeType.includes("glb")) return "model";

  if (mimeType.includes("svg")) return "svg";

  if (mimeType.includes("application")) return "application";

  return "other";
};

export const isSuperrareToken = (
  values: HasNft | undefined
): values is SuperrareNftConfig => values?.nftType === "superrare";

export const isEthereumToken = (
  values: HasNft | undefined
): values is EthNftConfig =>
  values?.nftType === "ethereum" || values?.nftType === "opensea";
export const isTezosToken = (
  values: HasNft | undefined
): values is TezosNftConfig => values?.nftType === "tezos";

export const isManualEntryToken = (
  values: Pick<HasNft, "nftType"> | undefined
): values is ManualEntryNftConfig => values?.nftType === "manual entry";

function toMetadata(manualEntryToken: ManualEntryToken): TokenTextInfo {
  return {
    description: manualEntryToken?.description,
    name: manualEntryToken?.name,
    creatorName: manualEntryToken?.creatorName,
    ownerName: manualEntryToken?.ownerName,
    collectionName: manualEntryToken?.collectionName,
    externalLink: manualEntryToken?.externalUrl,
  };
}

export const useTokenMetadata = (
  values: NftConfig | undefined
): TokenTextInfo => {
  const manualEntryToken = useMemo(() => {
    if (isManualEntryToken(values)) {
      return values.manualEntryToken;
    }
  }, [values]);

  const ethereumToken = useMemo(() => {
    if (isSuperrareToken(values) || isEthereumToken(values)) {
      return values.token;
    }
  }, [values]);

  const tezosToken = useMemo(() => {
    if (isTezosToken(values)) {
      return parseTezosTokenMetadata(values.tezosToken);
      // return values.tezosToken;
    }
  }, [values]);

  const tezosCreators = useMemo(() => {
    if (isTezosToken(values)) {
      return values.tezosCreators;
    }
  }, [values]);

  const tokenMetadata = useMemo((): TokenTextInfo => {
    if (manualEntryToken) {
      return toMetadata(manualEntryToken);
    }

    const updateStatus = values?.updateStatus;

    if (updateStatus === "updating") {
      return {
        description: "...",
        name: "Loading token...",
      };
    }

    if (updateStatus === "failed") {
      return {
        description: "",
        name: "Failed to load token.",
      };
    }
    if (updateStatus === "awaitingInput") {
      return {
        description: "...",
        name: "Awaiting Nft Configuration",
      };
    }

    const overrideDescription =
      values?.description && values?.description !== ""
        ? values?.description
        : undefined;

    if (ethereumToken) {
      const description =
        overrideDescription || ethereumToken?.metadata?.description;

      return {
        description,
        name: ethereumToken?.metadata?.name,
        creatorName: ethereumToken?.creator?.userName || undefined,
        ownerName: ethereumToken?.owner?.userName || undefined,
        collectionName: ethereumToken?.collectionName || undefined,
        externalLink: ethereumToken?.externalLink || undefined,
      };
    }

    if (tezosToken) {
      const description = overrideDescription || tezosToken.description;
      const creatorHash = tezosToken?.creators[0] || undefined;
      return {
        description,
        name: tezosToken?.name,
        creatorName: tezosCreators
          ? tezosCreators[0]?.alias || undefined
          : creatorHash,
        ownerName: undefined,
        collectionName: undefined,
        externalLink: undefined,
      };
    }
    return {
      description: "...",
      name: "Awaiting Nft Configuration",
    };
  }, [
    manualEntryToken,
    values?.updateStatus,
    values?.description,
    ethereumToken,
    tezosToken,
    tezosCreators,
  ]);

  return tokenMetadata;
};

const ipfsToUrl = (ipfs: string | undefined) => {
  if (!ipfs) return;
  const pathParts = ipfs.split("/");
  const address = pathParts[pathParts.length - 1];

  return `https://ipfs.io/ipfs/${address}`;
};

export const getMediaFileAndType = (
  config: NftConfig | undefined
): TokenMedia => {
  if (!config)
    return {
      inSpaceMediaFile: undefined,
      originalMediaFileType: undefined,
      originalMediaFile: undefined,
      inSpaceMediaFileType: undefined,
    };
  if (isManualEntryToken(config)) {
    const metadata = config.manualEntryToken;
    const mediaType = metadata?.mediaType;
    const mediaFile =
      mediaType === "image" || mediaType === "gif"
        ? metadata?.imageFile
        : metadata?.videoFile;

    return {
      originalMediaFileType: mediaType,
      inSpaceMediaFile: mediaFile,
      originalMediaFile: mediaFile,
    };
  } else {
    const updateStatus = config.updateStatus;
    if (updateStatus === "updating") {
      const mediaFile: FileLocation = {
        fileType: "external",
        url:
          "https://dummyimage.com/320x180/cccccc/fff.png&text=Loading token...",
      };
      return {
        originalMediaFileType: "image",
        inSpaceMediaFile: mediaFile,
        originalMediaFile: mediaFile,
      };
    }
    if (updateStatus === "failed") {
      const mediaFile: FileLocation = {
        fileType: "external",
        url:
          "https://dummyimage.com/320x180/cccccc/fff.png&text=Failed to load token.",
      };
      return {
        originalMediaFileType: "image",
        inSpaceMediaFile: mediaFile,
        originalMediaFile: mediaFile,
      };
    }
    if (updateStatus === "awaitingInput") {
      const mediaFile: FileLocation = {
        fileType: "external",
        url:
          "https://dummyimage.com/320x180/cccccc/fff.png&text=awaiting nft token input...",
      };
      return {
        originalMediaFileType: "image",
        inSpaceMediaFile: mediaFile,
        originalMediaFile: mediaFile,
      };
    }

    if (config.fetchingMedia) {
      const mediaFile: FileLocation = {
        fileType: "external",
        url:
          "https://dummyimage.com/320x180/cccccc/fff.png&text='loading nft media...'",
      };
      return {
        originalMediaFileType: "image",
        inSpaceMediaFile: mediaFile,
        originalMediaFile: mediaFile,
      };
    }

    let fileType: string | undefined;
    let inSpaceFileType: string | undefined;
    let originalFileUrl: string | undefined;

    if (isTezosToken(config)) {
      const metadata = parseTezosTokenMetadata(config.tezosToken);
      const formats = metadata?.formats;
      fileType = formats ? formats[0]?.mimeType : undefined;
      originalFileUrl = ipfsToUrl(metadata?.artifactUri);
      inSpaceFileType = fileType;
    } else {
      fileType = config.token?.metadata?.fileType;
      originalFileUrl = config?.token?.metadata?.fileUrl;
      inSpaceFileType = config?.mediaFileType || fileType;
    }

    const mediaType = fileType ? getMediaType(fileType) : undefined;
    const inSpaceMediaType = inSpaceFileType
      ? getMediaType(inSpaceFileType)
      : undefined;

    let originalMediaFile: FileLocation | undefined = undefined;
    if (originalFileUrl)
      originalMediaFile = {
        fileType: "external",
        url: originalFileUrl,
      };

    const inSpaceMediaFile =
      config.override3dMediaFile || config.mediaFile || undefined;

    return {
      inSpaceMediaFile,
      inSpaceMediaFileType: inSpaceMediaType,
      originalMediaFile,
      originalMediaFileType:
        config.override3dMediaFileType && config.override3dMediaFile
          ? config.override3dMediaFileType
          : mediaType,
    };
  }
};
