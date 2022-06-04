import {
  LegacyTezosTokenDetails,
  TezosTokenDetails,
  TezosTokenMetadata,
} from "../../../../../shared/nftTypes/tezos";

export const isLegacyTezosToken = (
  tezosToken: TezosTokenDetails
): tezosToken is LegacyTezosTokenDetails => {
  if (!tezosToken) return false;
  if (typeof tezosToken.contract === "string") return true;

  return false;
};

export const parseLegacyTokenMetadata = (
  tezosToken: LegacyTezosTokenDetails
): TezosTokenMetadata => {
  return {
    artifactUri: tezosToken.artifact_uri,
    creators: tezosToken.creators,
    decimals: tezosToken.decimals,
    description: tezosToken.description,
    displayUri: tezosToken.display_uri,
    formats: tezosToken.formats,
    name: tezosToken.name,
    symbol: tezosToken.symbol,
    tags: tezosToken.tags,
    thumbnailUri: tezosToken.thumbnail_uri,
  };
};

export const parseTezosTokenMetadata = (
  tezosToken: TezosTokenDetails | undefined
) => {
  if (!tezosToken) return null;

  if (isLegacyTezosToken(tezosToken))
    return parseLegacyTokenMetadata(tezosToken);

  return tezosToken.metadata;
};

export const parseTezosTokenValues = (
  tezosToken: TezosTokenDetails | undefined
) => {
  if (!tezosToken) return null;

  if (isLegacyTezosToken(tezosToken))
    return {
      tokenId: tezosToken.token_id,
      totalSupply: tezosToken.supply,
      contract: tezosToken.contract,
    };

  return {
    tokenId: tezosToken.tokenId,
    totalSupply: tezosToken.totalSupply,
    contract: tezosToken.contract.address,
  };
};
