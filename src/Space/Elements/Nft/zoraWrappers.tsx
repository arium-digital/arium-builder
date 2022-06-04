import { Networks, useZNFTType } from "@zoralabs/nft-hooks";
import { NFTFetchContext } from "@zoralabs/nft-hooks/dist/context/NFTFetchContext";
import {
  addAuctionInformation,
  auctionDataToPricing,
} from "@zoralabs/nft-hooks/dist/fetcher/TransformFetchResults";
import { useContext } from "react";
import useSWR from "swr";
import Big from "big.js";

import type { Revalidator, RevalidatorOptions } from "swr";
import {
  CurrencyLookupType,
  IndexerDataType,
  NFTDataType,
  ZNFTMediaDataType,
} from "@zoralabs/nft-hooks/dist/fetcher/AuctionInfoTypes";
import { IndexerTokenWithAuctionFragment } from "@zoralabs/nft-hooks/dist/graph-queries/zora-indexer-types";
import { ReserveAuctionPartialFragment } from "@zoralabs/nft-hooks/dist/graph-queries/zora-graph-types";

export class NotFoundError extends Error {}
export class ArgumentsError extends Error {}

export const onErrorRetry = (
  err: Error,
  _: any,
  __: any,
  revalidate: Revalidator,
  revalidateOpts: RevalidatorOptions
) => {
  if (err instanceof NotFoundError) {
    // Don't retry for 404 records
    return;
  }
  if (err instanceof ArgumentsError) {
    // Don't retry for invalid arguments
    return;
  }
  if (revalidateOpts.retryCount || 5 < 4) {
    // Retry with error other than not found
    revalidate(revalidateOpts);
  }
};

export function transformNFTIndexerResponse(
  data: IndexerTokenWithAuctionFragment,
  auction?: ReserveAuctionPartialFragment,
  currency?: CurrencyLookupType
): IndexerDataType {
  return {
    nft: {
      tokenId: data.tokenId.toString(),
      contract: {
        address: data.address,
        name: data.tokenContract?.name?.toString(),
        symbol: data.tokenContract?.symbol?.toString(),
      },
      owner: data.owner,
      creator: data.minter || undefined,
      metadataURI: data.tokenURI || "",
    },
    zoraNFT: data.media
      ? {
          // TODO(iain): make properly optional
          createdAtTimestamp: data.mintTransferEvent?.blockTimestamp || 0,
          // TODO(iain): make properly optional
          contentURI: data.media.contentURI || "",
          contentHash: data.media.contentHash,
          // TODO(iain): make properly optional
          metadataURI: data.media.metadataURI || "",
          metadataHash: data.media.metadataHash,
          ownerBidShare: data.media.ownerBidShare,
          ownerBidSharePercentage: data.media.ownerBidShare
            ? new Big(data.media.ownerBidShare)
                .div(new Big(10).pow(18))
                .toNumber()
            : 0,
          creatorBidShare: data.media.creatorBidShare,
          creatorBidSharePercentage: data.media.creatorBidShare
            ? new Big(data.media.creatorBidShare)
                .div(new Big(10).pow(18))
                .toNumber()
            : 0,
        }
      : undefined,
    zoraIndexerResponse: data,
    pricing: addAuctionInformation(
      {
        reserve: auctionDataToPricing(auction),
      },
      currency
    ),
  };
}

export function getCurrenciesInUse(
  nftPricing: NFTDataType["pricing"]
): string[] {
  const hasReserve = nftPricing.reserve;
  if (hasReserve) {
    const auctionCurrencyId = nftPricing.reserve?.auctionCurrency.id;
    if (auctionCurrencyId) {
      return [auctionCurrencyId];
    }
  }
  const bids =
    nftPricing.perpetual?.bids?.map((bid) => bid.pricing.currency.id) || [];
  const ask = nftPricing.perpetual.ask?.pricing.currency.id;
  if (ask) {
    return [...bids, ask];
  }
  return bids;
}

// import { IndexerDataType, NFTDataType } from '../fetcher/AuctionInfoTypes';
// import { transformNFTIndexerResponse } from '../fetcher/ZoraIndexerTransformers';
// import { onErrorRetry } from '../fetcher/ErrorUtils';

export type OptionsType = {
  refreshInterval?: number;
  initialData?: any;
  loadCurrencyInfo?: boolean;
  useBetaIndexer?: boolean;
};

// type NetworkNames = 'MAINNET' | 'RINKEBY' | 'POLYGON' | 'MUMBAI' | 'ROPSTEN';
// type NetworkIDs = '1' | '3' | '4' | '137' | '80001';

// // Supported networks with Zora contract deployments.
// // As more networks are supported by zora more network IDs will be added.
// const Networks: Record<NetworkNames, NetworkIDs> = {
//   MAINNET: '1',
//   ROPSTEN: '3',
//   RINKEBY: '4',
//   POLYGON: '137',
//   MUMBAI: '80001',
// };

export const ZORA_MEDIA_CONTRACT_BY_NETWORK = {
  [Networks.MAINNET]: "0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7",
  [Networks.RINKEBY]: "0x7C2668BD0D3c050703CEcC956C11Bd520c26f7d4",
  [Networks.MUMBAI]: "0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7",
  [Networks.POLYGON]: "0x6953190AAfD8f8995e8f47e8F014d0dB83E92300",
};

export type useNFTType = {
  currencyLoaded: boolean;
  error?: string;
  data?: NFTDataType;
};

/**
 * Fetches on-chain NFT data and pricing for the given zNFT id
 * Deprecated: Please use useNFT instead.
 *
 * @param id id of zNFT to fetch blockchain information for
 * @param options SWR flags and an option to load currency info
 * @returns useNFTType hook results include loading, error, and chainNFT data.
 */
export function useZNFT(id?: string, options: OptionsType = {}): useZNFTType {
  const fetcher = useContext(NFTFetchContext);
  const { loadCurrencyInfo = false, refreshInterval, initialData } =
    options || {};

  const nftData = useSWR<ZNFTMediaDataType>(
    id ? ["loadZNFTDataUntransformed", id] : null,
    (_, id) => fetcher.loadZNFTDataUntransformed(id),
    { refreshInterval, dedupingInterval: 0 }
  );
  const currencyData = useSWR(
    nftData.data && nftData.data.pricing && loadCurrencyInfo
      ? [
          "loadCurrencies",
          ...getCurrenciesInUse(addAuctionInformation(nftData.data.pricing)),
        ]
      : null,
    (_, ...currencies) => fetcher.loadCurrencies(currencies),
    {
      refreshInterval,
      dedupingInterval: 0,
    }
  );

  let data;
  if (nftData.data !== undefined) {
    data = {
      ...nftData.data,
      pricing: addAuctionInformation(nftData.data.pricing, currencyData.data),
    };
  } else {
    data = initialData;
  }

  return {
    currencyLoaded: !!currencyData.data,
    error: nftData.error,
    data,
  };
}

/**
 * Fetches on-chain NFT data and pricing for the given NFT id and contract address
 *
 * @param contractAddress address of the contract, if null and tokenID is passed in, a ZNFT is assumed
 * @param tokenId id of NFT to fetch blockchain information for
 * @param options SWR flags and an option to load currency info
 * @returns useNFTType hook results include loading, error, and chainNFT data.
 */
function useNFTIndexer(
  contractAddress?: string,
  tokenId?: string,
  options: OptionsType = {}
): useNFTType {
  const fetcher = useContext(NFTFetchContext);
  const { refreshInterval, initialData, loadCurrencyInfo = true } =
    options || {};

  const nftData = useSWR(
    contractAddress && tokenId
      ? ["loadIndexerNFT", contractAddress, tokenId]
      : null,
    (_, contractAddress, tokenId) =>
      fetcher.loadZoraNFTIndexerNFTUntransformed(contractAddress, tokenId),
    { dedupingInterval: 0, initialData: initialData?.tokenData, onErrorRetry }
  );

  // TODO(iain): Integrate auction data from zora indexer into hook
  const auctionData = useSWR(
    contractAddress && tokenId
      ? ["loadAuctionForNFT", contractAddress, tokenId]
      : null,
    (_, contractAddress, tokenId) =>
      fetcher.loadAuctionInfo(contractAddress, tokenId),
    { refreshInterval, initialData: initialData?.auctionData, onErrorRetry }
  );

  const currencyData = useSWR(
    nftData && nftData.data && loadCurrencyInfo
      ? ["loadCurrencies", auctionData.data?.auctionCurrency.id]
      : null,
    (_, ...currencies) => fetcher.loadCurrencies(currencies),
    {
      refreshInterval,
      dedupingInterval: 0,
    }
  );

  const data: IndexerDataType | undefined =
    nftData.data !== undefined
      ? transformNFTIndexerResponse(
          nftData.data,
          auctionData.data,
          currencyData.data
        )
      : initialData;

  return {
    currencyLoaded: !!currencyData.data,
    error: nftData.error?.toString(),
    data,
  };
}

export function useOpenseaPricing(
  contractAddress?: string,
  tokenId?: string,
  options: OptionsType = {}
) {
  const fetcher = useContext(NFTFetchContext);
  const { loadCurrencyInfo = false, refreshInterval } = options || {};

  const auctionData = useSWR(
    contractAddress && tokenId
      ? ["loadAuctionForNFT", contractAddress, tokenId]
      : null,
    async (_, contractAddress, tokenId) =>
      fetcher.loadAuctionInfo(contractAddress, tokenId)
  );

  const currencyData = useSWR(
    loadCurrencyInfo
      ? ["loadCurrencies", auctionData?.data?.auctionCurrency]
      : null,
    (_, ...currencies) =>
      // @ts-ignore
      fetcher.loadCurrencies(currencies),
    {
      refreshInterval,
      dedupingInterval: 0,
    }
  );

  const pricing = addAuctionInformation(
    {
      reserve: auctionDataToPricing(auctionData.data),
    },
    currencyData.data
  );

  return {
    currencyLoaded: !!currencyData.data,
    data: {
      pricing,
    },
    error: auctionData.error,
  };
}

/**
 * Fetches on-chain NFT data and pricing for the given zNFT id
 *
 * @param contractAddress address of the contract, if null and tokenID is passed in, a ZNFT is assumed
 * @param tokenId id of NFT to fetch blockchain information for
 * @param options SWR flags and an option to load currency info
 * @returns useNFTType hook results include loading, error, and chainNFT data.
 */
export function useNftPricing({
  contractAddress,
  tokenId,
  options = {},
}: { contractAddress?: string; tokenId?: string; options?: OptionsType } = {}) {
  const fetcher = useContext(NFTFetchContext);

  const resolvedContractAddress = !contractAddress
    ? ZORA_MEDIA_CONTRACT_BY_NETWORK[fetcher.networkId]
    : contractAddress;

  const isZoraContractAddress =
    resolvedContractAddress ===
    ZORA_MEDIA_CONTRACT_BY_NETWORK[fetcher.networkId];

  const openseaPricing = useOpenseaPricing(
    !options.useBetaIndexer && !isZoraContractAddress
      ? resolvedContractAddress
      : undefined,
    !options.useBetaIndexer && !isZoraContractAddress ? tokenId : undefined,
    options
  );

  const betaIndexerNFT = useNFTIndexer(
    options.useBetaIndexer ? resolvedContractAddress : undefined,
    options.useBetaIndexer ? tokenId : undefined,
    options
  );

  const zoraNft = useZNFT(
    !options.useBetaIndexer && isZoraContractAddress ? tokenId : undefined,
    options
  );

  const data = options.useBetaIndexer
    ? betaIndexerNFT
    : isZoraContractAddress
    ? zoraNft
    : openseaPricing;

  return {
    currencyLoaded: data?.currencyLoaded,
    pricing: data?.data?.pricing,
    error: data?.error,
  };
}
