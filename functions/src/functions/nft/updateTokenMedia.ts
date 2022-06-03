// import {MediaFetchAgent} from "@zoralabs/nft-hooks";
import * as functions from "firebase-functions";
import {
  EthTokenMediaParams,
  TezosTokenMediaParams,
  Token,
  TokenMediaParms,
  UpdateTokenMediaParams,
} from "../../../../shared/nftTypes";
import { DocumentReference, store } from "../../db";
import uploadTokenMedia from "../../nft/lib/mediaUpload";
// import { MediaFetchAgent } from "@zoralabs/nft-hooks";

import AbortController from "node-abort-controller";
import { TezosTokenDetailsV2 } from "../../../../shared/nftTypes/tezos";

declare type NetworkNames = "MAINNET" | "RINKEBY" | "POLYGON" | "MUMBAI";
declare type NetworkIDs = "1" | "4" | "137" | "80001";
declare const Networks: Record<NetworkNames, NetworkIDs>;
export { Networks };

/**
 * Simple Fetch wrapper that enables a timeout.
 * Allows for showing an error state for slow-to-load IPFS files
 */
export class FetchWithTimeout {
  controller: AbortController;
  expectedContentType?: string;
  timeoutDuration: number;

  constructor(
    timeoutDuration = 5000,
    contentType: string | undefined = undefined
  ) {
    this.controller = new AbortController();
    this.expectedContentType = contentType;
    this.timeoutDuration = timeoutDuration;
    // Bind context to class
    this.fetch = this.fetch.bind(this);
  }
  async fetch(url: string, options: any = {}) {
    const controller = this.controller;
    const response = await fetch(url, {
      ...options,
      signal: this.controller.signal,
    });
    setTimeout(() => controller.abort(), this.timeoutDuration);
    if (response.status !== 200) {
      throw new Error(`Request Status = ${response.status}`);
    }
    if (
      this.expectedContentType &&
      !response.headers
        .get("content-type")
        ?.startsWith(this.expectedContentType)
    ) {
      throw new Error("Reponse Content Type incorrect");
    }
    return response;
  }
}

const uploadAndSetTokenMedia = async ({
  fileUrl,
  fileType,
  tokenAddress,
  tokenId,
  ref,
}: {
  fileUrl: string;
  fileType: string;
  tokenAddress: string;
  tokenId: string;
  ref: DocumentReference;
}) => {
  const {
    location: mediaFile,
    fileType: mediaFileType,
  } = await uploadTokenMedia({
    fileUrl,
    fileType,
    tokenId,
    tokenAddress,
  });

  console.log({
    mediaFile,
  });

  await ref.update({
    "nft.mediaFile": mediaFile,
    "nft.mediaFileType": mediaFileType,
    "nft.fetchingMedia": false,
    "nft.token.metadata.fileUrl": fileUrl,
    "nft.token.metadata.fileType": fileType,
  });
};

export const ZORA_IPFS_GATEWAY = "https://zora-prod.mypinata.cloud";
export const STANDARD_IPFS_GATEWAY = "https://ipfs.io";

export function convertURIToHTTPSInnfer({
  url,
  ipfsHost = STANDARD_IPFS_GATEWAY,
}: {
  url: string | undefined;
  ipfsHost?: string;
}) {
  if (!url) return undefined;
  if (url.startsWith("ipfs://ipfs")) {
    return url.replace("ipfs://", `${ipfsHost}/`);
  }
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", `${ipfsHost}/ipfs/`);
  }
  return url;
}

function convertURIToHTTPS(args: {
  url: string | undefined;
  ipfsHost?: string;
}) {
  const result = convertURIToHTTPSInnfer(args);

  if (!result)
    throw new Error(`missing result, inputs were, ${JSON.stringify(args)}`);

  return result;
}

async function fetchIPFSMetadata({
  url,
  ipfsHost,
}: {
  url: string;
  ipfsHost: string;
}) {
  // TODO(iain): Properly parse metadata from `ourzora/media-metadata-schemas`
  const request = await new FetchWithTimeout(8000, "application/json").fetch(
    convertURIToHTTPS({ url: url as string, ipfsHost }) as string
  );
  try {
    return await request.json();
  } catch (e) {
    console.error(e);
    throw new Error("Cannot read JSON metadata from IPFS");
  }
}

/**
 * Fetch Content MIME type from content URI
 *
 * @param url IPFS Content URI
 * @returns mime type as a string
 * @throws RequestError
 */
async function fetchContentMimeType({
  url,
  ipfsHost,
}: {
  url: string;
  ipfsHost: string;
}): Promise<string> {
  const response = await new FetchWithTimeout(8000).fetch(
    convertURIToHTTPS({ url, ipfsHost }) as string,
    {
      method: "HEAD",
    }
  );
  const header = response.headers.get("content-type");
  if (!header) {
    throw new Error("No content type returned for URI");
  }
  return header;
}

export type MediaContentType =
  | { uri: string; type: "uri"; mimeType: string }
  | { text: string; type: "text"; mimeType: string };

async function fetchContent({
  url,
  contentType,
  ipfsHost,
}: {
  url: string;
  contentType: string;
  ipfsHost: string;
}): Promise<MediaContentType> {
  if (contentType.startsWith("text/")) {
    try {
      const response = await new FetchWithTimeout(8000).fetch(
        convertURIToHTTPS({ url, ipfsHost }) as string
      );
      return {
        text: await response.text(),
        type: "text",
        mimeType: contentType,
      };
    } catch (e: any) {
      throw new Error("Issue fetching IPFS data");
    }
  }
  return { uri: url, type: "uri", mimeType: contentType };
}

export const updateTokenFromMetadata = async (
  token: Token,
  ref: DocumentReference,
  tokenAddress: string
) => {
  let fileUrl: string | undefined;
  let fileType: string | undefined;
  // Be careful making multiple instances of the fetch agent
  // Each instance contains a different request cache.
  if (token.tokenMetadata) {
    // const meta = await fetchAgent.
    console.log(token);
    const metadata = await fetchIPFSMetadata({
      url: token.tokenMetadata,
      ipfsHost: ZORA_IPFS_GATEWAY,
    });

    // zora metadata has all we need
    if (metadata.contentType && metadata.contentURI) {
      const ipfsGateway = ZORA_IPFS_GATEWAY;
      const uri = metadata.contentURI;
      const result = await fetchContent({
        url: uri,
        contentType: metadata.contentType,
        ipfsHost: ipfsGateway,
      });

      console.log("using zora", {
        uri,
        resultMimeType: result.mimeType,
        resulturi: uri,
      });

      if (result.type === "uri") {
        fileUrl = convertURIToHTTPS({ url: result.uri, ipfsHost: ipfsGateway });
        fileType = metadata.contentType;
      }
    } else {
      const ipfsGateway = STANDARD_IPFS_GATEWAY;
      const uri = token.metadata?.fileUrl || extractUriFromMetadata(metadata);
      console.log("non zora token; using fileUrl and metatadata:", {
        fileUrl: token.metadata?.fileUrl,
        metadata,
        resultUrl: uri,
      });
      const mimeType = await fetchContentMimeType({
        url: uri,
        ipfsHost: ipfsGateway,
      });
      const result = await fetchContent({
        url: uri,
        contentType: mimeType,
        ipfsHost: ipfsGateway,
      });
      // const metadata = await parser.fetchMetadata(tokenAddress, token.tokenId);

      if (result.type === "uri") {
        fileUrl = convertURIToHTTPS({ url: result.uri, ipfsHost: ipfsGateway });
        fileType = result.mimeType;
      }
    }
  } else if (token.metadata?.fileUrl) {
    console.log("using file uri", token.metadata?.fileUrl);
    const ipfsGateway = STANDARD_IPFS_GATEWAY;
    const uri = token.metadata?.fileUrl;
    const mimeType = await fetchContentMimeType({
      url: uri,
      ipfsHost: ipfsGateway,
    });
    const result = await fetchContent({
      url: uri,
      contentType: mimeType,
      ipfsHost: ipfsGateway,
    });

    if (result.type === "uri") {
      fileUrl = convertURIToHTTPS({ url: result.uri, ipfsHost: ipfsGateway });
      fileType = result.mimeType;
    }
  }
  if (fileUrl && fileType) {
    console.log("final to use:", { fileType, fileUrl });
    await uploadAndSetTokenMedia({
      fileUrl,
      fileType,
      tokenAddress,
      tokenId: token.tokenId,
      ref,
    });
  }
};

export const updateTezosTokenFromMetadata = async (
  tezosObjkt: TezosTokenDetailsV2,
  elementDocRef: DocumentReference
) => {
  const ipfsAddress = tezosObjkt.metadata.artifactUri;
  const fileType = tezosObjkt.metadata.formats[0].mimeType;

  const url = convertURIToHTTPS({
    url: ipfsAddress,
    ipfsHost: STANDARD_IPFS_GATEWAY,
  }) as string;

  await uploadAndSetTokenMedia({
    fileUrl: url,
    fileType,
    ref: elementDocRef,
    tokenAddress: tezosObjkt.contract.address,
    tokenId: tezosObjkt.tokenId.toString(),
  });
};
function extractUriFromMetadata(metadata: any): string {
  const standardImageMetadata =
    metadata.animation_url || metadata.image || metadata.external_url;

  if (standardImageMetadata) return standardImageMetadata;

  //makerspace
  if (metadata.properties?.preview_media_file2 || metadata.imageUrl) {
    if (metadata.properties?.preview_media_file2) {
      return metadata.properties?.preview_media_file2.description;
    }

    return metadata.imageUrl;
  }

  throw new Error("could not get metadata image");
}

const isEthToken = (values: TokenMediaParms): values is EthTokenMediaParams => {
  return values.nftType === "ethereum";
};

const isTezosToken = (
  values: TokenMediaParms
): values is TezosTokenMediaParams => {
  return values.nftType === "tezos";
};

// This was initially exposed to support updating the Nft Token Media manually for superrare
export const updateTokenMedia = functions
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 300,
    memory: "2GB",
  })
  .https.onCall(async (fetchData: UpdateTokenMediaParams, context) => {
    const userId = context.auth?.uid;
    if (!userId) throw new Error("must be authorized");

    const { spaceId, elementId } = fetchData;

    if (!spaceId || !elementId)
      throw new Error("spaceId and elementId are required");

    const elementDocRef = store
      .collection("spaces")
      .doc(spaceId)
      .collection("elementsTree")
      .doc(elementId);

    const doc = fetchData.tokenInfo;

    if (isEthToken(doc)) {
      if (!doc.token || !doc.token.tokenAddress)
        throw new Error("missing token or address");

      return await updateTokenFromMetadata(
        doc.token,
        elementDocRef,
        doc.token.tokenAddress
      );
    }

    if (isTezosToken(doc)) {
      const tezosToken = doc.tezosToken as TezosTokenDetailsV2 | undefined;

      if (!tezosToken) throw new Error("missing tezos token");

      return await updateTezosTokenFromMetadata(tezosToken, elementDocRef);
    }

    throw new Error("unknown token type");
  });
