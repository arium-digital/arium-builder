/* eslint-disable react/jsx-no-target-blank */
import { hicetnuncContract } from "Editor/components/Elements/Nft/NftForm";
import { memo } from "react";
import { NftConfig } from "spaceTypes/nftConfig";
import {
  HasEthNft,
  HasSuperrareNft,
  HasTezosNft,
} from "../../../../shared/nftTypes";
import { parseTezosTokenValues } from "./tezos/parseTezosToken";
import {
  isEthereumToken,
  isManualEntryToken,
  isSuperrareToken,
  isTezosToken,
  TokenTextInfo,
} from "./tokenConversion";

const getArtworkPath = ({
  superrareVersion,
  tokenAddress,
}: Pick<HasSuperrareNft, "superrareVersion" | "tokenAddress">) => {
  if (superrareVersion === "v1") return "artwork";

  if (superrareVersion === "v2") return `artwork-${superrareVersion}`;

  return tokenAddress;
};

const SuperrareAssetDetailsContents = ({
  token,
  superrareVersion = "v2",
  tokenId,
  tokenMetadata,
  tokenAddress,
}: HasSuperrareNft & {
  tokenMetadata: TokenTextInfo | undefined;
}) => {
  const metadata = token?.metadata;
  if (!metadata) return null;

  const artworkPath = getArtworkPath({ superrareVersion, tokenAddress });
  const url = `https://superrare.com/${artworkPath}/${tokenId}`;
  return (
    <>
      <p>
        <b>{metadata?.name}</b>
      </p>
      <p>
        Creator: @{tokenMetadata?.creatorName}
        <br />
        Owner: @{tokenMetadata?.ownerName}
      </p>

      {tokenMetadata?.description && <p>{tokenMetadata?.description}</p>}
      <p>
        <a href={url} target="_blank" title="Artwork Auction on Superrare">
          View on Superrare
        </a>
      </p>
    </>
  );
};

const getExternalLink = (values: NftConfig) => {
  const {
    overrideNftLink,
    overrideNftLinkText,
    overrideNftLinkUrl,
    token,
  } = values;

  if (overrideNftLink && overrideNftLinkText && overrideNftLinkUrl)
    return {
      text: overrideNftLinkText,
      url: overrideNftLinkUrl,
    };

  if (token?.externalLink) {
    return {
      url: token?.externalLink,
      text: `View on ${token?.collectionName}`,
    };
  }

  return null;
};
const OpenSeaAssetDetailsContents = ({
  token,
  tokenMetadata,
  ...rest
}: HasEthNft &
  NftConfig & {
    tokenMetadata: TokenTextInfo | undefined;
  }) => {
  const metadata = token?.metadata;
  if (!metadata) return null;

  const externalLink = getExternalLink({
    ...rest,
    token,
  });

  return (
    <>
      <p>
        <b>{tokenMetadata?.name}</b>
      </p>
      <p>
        {tokenMetadata?.creatorName &&
          `Creator: @${tokenMetadata?.creatorName}`}
        {tokenMetadata?.ownerName && (
          <>
            <br />
            Owner: @{tokenMetadata?.ownerName}
          </>
        )}
      </p>
      {tokenMetadata?.description && <p>{tokenMetadata?.description}</p>}
      {externalLink && (
        <p>
          <a href={externalLink.url} target="_blank" title={externalLink.text}>
            {externalLink.text}
          </a>
        </p>
      )}
      {!externalLink && token?.openSeaLink && (
        <p>
          <a href={token.openSeaLink} target="_blank" title="Video on OpenSea">
            View on OpenSea
          </a>
        </p>
      )}
    </>
  );
};

function isHicetnuncContract(contract: string) {
  return contract === hicetnuncContract;
}

const tezosDomainAndContract = (contract: string | null | undefined) => {
  if (!contract) return null;
  if (isHicetnuncContract(contract))
    return {
      domain: "https://hic.link/",
      site: "teia.art",
    };

  return {
    domain: `https://objkt.com/asset/${contract}/`,
    site: "object.com",
  };
};
const TezosAssetDetailsContents = ({
  tezosToken,
  tokenMetadata,
}: HasTezosNft & {
  tokenMetadata: TokenTextInfo | undefined;
}) => {
  const parsedInfo = parseTezosTokenValues(tezosToken);
  const domainAndContract = tezosDomainAndContract(parsedInfo?.contract);
  return (
    <>
      <ManualEntryAssetDetailsContents tokenMetadata={tokenMetadata} />
      {parsedInfo?.totalSupply && (
        <p>
          <b>{parsedInfo?.totalSupply} Editions</b>
        </p>
      )}
      {parsedInfo?.tokenId && domainAndContract && (
        <p>
          <a
            href={`${domainAndContract.domain}${parsedInfo?.tokenId}`}
            target="_blank"
            title="View on Objkt.com"
          >
            view on {domainAndContract.site}
          </a>
        </p>
      )}
    </>
  );
};

const ManualEntryAssetDetailsContents = ({
  tokenMetadata,
}: {
  tokenMetadata: TokenTextInfo | undefined;
}) => {
  return (
    <>
      <p>
        <b>{tokenMetadata?.name}</b>
      </p>
      <p>
        {tokenMetadata?.creatorName &&
          `Creator: @${tokenMetadata?.creatorName}`}
        {tokenMetadata?.ownerName && (
          <>
            <br />
            Owner: @{tokenMetadata?.ownerName}
          </>
        )}
      </p>
      {tokenMetadata?.description && <p>{tokenMetadata?.description}</p>}
      {tokenMetadata?.externalLink && (
        <p>
          <a
            href={tokenMetadata.externalLink}
            target="_blank"
            title={`View on ${tokenMetadata.collectionName}`}
          >
            View on {tokenMetadata.collectionName}
          </a>
        </p>
      )}
    </>
  );
};

const AssetDetailsContents = memo(
  ({
    values,
    tokenMetadata,
  }: {
    values: NftConfig;
    tokenMetadata: TokenTextInfo | undefined;
  }) => {
    if (isSuperrareToken(values))
      return (
        <SuperrareAssetDetailsContents
          {...values}
          tokenMetadata={tokenMetadata}
        />
      );

    if (isEthereumToken(values))
      return (
        <OpenSeaAssetDetailsContents
          {...values}
          tokenMetadata={tokenMetadata}
        />
      );
    if (isTezosToken(values))
      return (
        <TezosAssetDetailsContents {...values} tokenMetadata={tokenMetadata} />
      );

    if (isManualEntryToken(values))
      return (
        <ManualEntryAssetDetailsContents
          {...values}
          tokenMetadata={tokenMetadata}
        />
      );

    return null;
  }
);

export default AssetDetailsContents;
