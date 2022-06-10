import "isomorphic-unfetch";
// // import FileType from "file-type";
// import got from "got";
import * as QueryString from "query-string";
import { accountFromJSON, assetFromJSON } from "./openSeaCopy";
import {
  Network,
  OpenSeaAccount,
  OpenSeaAsset,
} from "../../../../shared/nftTypes/opensea";
// import { convertURIToHTTPS } from "../../functions/nft/updateTokenMedia";

const ORDERBOOK_VERSION: number = 1;
const API_PATH = `/api/v${ORDERBOOK_VERSION}`;

// const STATIC_CALL_DECENTRALAND_ESTATES_ADDRESS = '0x93c3cd7ba04556d2e3d7b8106ce0f83e24a87a7e'
// const DEFAULT_BUYER_FEE_BASIS_POINTS = 0
// const DEFAULT_SELLER_FEE_BASIS_POINTS = 250
// const OPENSEA_SELLER_BOUNTY_BASIS_POINTS = 100
// const DEFAULT_MAX_BOUNTY = DEFAULT_SELLER_FEE_BASIS_POINTS
// const MIN_EXPIRATION_SECONDS = 10
// const ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7
// const SELL_ORDER_BATCH_SIZE = 3
// const ORDERBOOK_VERSION: number = 1
// const API_VERSION: number = 1
const API_BASE_MAINNET = "https://api.opensea.io";
const API_BASE_RINKEBY = "https://testnets-api.opensea.io";
const SITE_HOST_MAINNET = "https://opensea.io";
const SITE_HOST_RINKEBY = "https://rinkeby.opensea.io";
// const RPC_URL_PATH = 'jsonrpc/v1/'
// const MAINNET_PROVIDER_URL = `${API_BASE_MAINNET}/${RPC_URL_PATH}`
// const RINKEBY_PROVIDER_URL = `${API_BASE_RINKEBY}/${RPC_URL_PATH}`
// const ORDERBOOK_PATH = `/wyvern/v${ORDERBOOK_VERSION}`
// const API_PATH = `/api/v${ORDERBOOK_VERSION}`

const getApiBaseUrl = (networkName?: Network) => {
  switch (networkName) {
    case Network.Rinkeby:
      return {
        baseUrl: API_BASE_RINKEBY,
        hostUrl: SITE_HOST_RINKEBY,
      };
    case Network.Main:
    default:
      return {
        baseUrl: API_BASE_MAINNET,
        hostUrl: SITE_HOST_MAINNET,
      };
  }
};

const _fetch = (apiPath: string) => {
  // const apiBase = apiBaseUrl
  // const apiKey = this.apiKey
  const finalUrl = getApiBaseUrl().baseUrl + apiPath;
  console.log("final url", finalUrl);
  const finalOpts = {
    // ...opts,
    headers: {
      "X-API-KEY": "2d807c8829e34157b812039e106c4894",
      // ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
      // ...(opts.headers || {}),
    },
  };

  // this.logger(`Sending request: ${finalUrl} ${JSON.stringify(finalOpts).substr(0, 100)}...`)

  return fetch(finalUrl, finalOpts);
};

const get = async (apiPath: string, query: object = {}): Promise<any> => {
  const qs = QueryString.stringify(query);
  const url = `${apiPath}?${qs}`;

  const response = await _fetch(url);
  return response.json();
};

export const getAssetWithTokenMetadata = async (
  {
    tokenAddress,
    tokenId,
  }: {
    tokenAddress: string;
    tokenId: string | number | null;
  },
  retries = 1
): Promise<OpenSeaAssetWithTokenMetadata> => {
  const json = await get(`${API_PATH}/asset/${tokenAddress}/${tokenId || 0}/`);

  // console.log('got json', require('util').inspect(json));

  // if (tokenId) {
  //   console.log('fetching metadata');
  //   const parsed = await parser.fetchMetadata(tokenAddress, tokenId as string);

  //   console.log(parsed);
  // }

  const asset = await assetFromJSONWithTokenMetadata(json);

  console.log("got token metadata response from opensea", json.token_metadata);

  console.log("asset response", {
    token_metadata: json.token_metadata,
    fileUrl: asset.fileUrl,
  });

  return asset;
};

export interface OpenSeaAssetWithTokenMetadata extends OpenSeaAsset {
  fileUrl?: string;
  fileType?: string;
  creator?: OpenSeaAccount;
}

// export type Erc721Token = {
//   name?: string | null,
//   description?: string | null,
//   image?: string | null,
//   animationUrl?: string | null,
//   externalUrl?: string | null
// }

// export type AssetAndToken = {
//   asset: OpenSeaAssetWithTokenMetadata,
//   token?: Erc721Token
// }
async function assetFromJSONWithTokenMetadata(
  json: any
): Promise<OpenSeaAssetWithTokenMetadata> {
  const imageUrl = json.image_url;
  const imageOriginalUrl = json.image_original_url;
  const animationOriginalUrl = json.animation_original_url;

  const fileUrl = animationOriginalUrl || imageOriginalUrl || imageUrl;
  // let fileType: FileType.FileTypeResult | undefined = undefined;

  // if (fromIpfsUrl) {
  //   const stream = got.stream(fromIpfsUrl);

  //   console.log('getting file type');
  //   fileType = await FileType.fromStream(stream);
  //   console.log('got file type.');
  // }

  const creator = json.creator ? accountFromJSON(json.creator) : undefined;

  // console.log(json);

  const result: OpenSeaAssetWithTokenMetadata = {
    ...assetFromJSON(json),
    fileUrl,
    // fileType: fileType?.mime,
    creator,
  };

  return result;
}
// async function getToken(tokenMetadata: string) {
//   console.log('fetching token from ', tokenMetadata);
//   const response = await (await fetch(tokenMetadata)).json();

//   const result: Erc721Token = {
//     name: response.name,
//     description: response.description,
//     image: response.image,
//     animationUrl: response.animation_url,
//     externalUrl: response.external_url
//   }

//   return result;

// }
