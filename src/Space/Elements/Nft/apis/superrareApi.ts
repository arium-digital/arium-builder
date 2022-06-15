import {
  FetchSuperrareTokenAndUpdateNftParams,
  HasSuperrareNft,
  NftUpdateStatus,
  Web3Account,
} from "../../../../../shared/nftTypes";
import {
  Creator,
  SuperrareContractVersion,
  SuperrareToken,
} from "../../../../../shared/nftTypes/superrare";
import * as Forms from "Editor/components/Form";

const getHistoryUrl = "https://superrare.com/api/v2/nft/get";
const contracts: { [version in SuperrareContractVersion]?: string } = {
  v2: "0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0",
  v1: "0x41a322b28d0ff354040e2cbc676f0320d8c8850d",
};

const getContractAddress = ({
  contractVersion,
  contractAddress,
}: {
  contractVersion: SuperrareContractVersion;
  contractAddress: string | undefined;
}) => {
  if (contractVersion === "custom") {
    if (!contractAddress)
      throw new Error("contract address must be defined if contract is custom");

    return contractAddress;
  }

  return contracts[contractVersion];
};

export const getBidHistory = async (
  tokenId: number,
  contractVersion: SuperrareContractVersion,
  contractAddress: string | undefined
): Promise<SuperrareToken> => {
  const contractAddressToUse = getContractAddress({
    contractAddress,
    contractVersion,
  });
  let body = {
    tokenId,
    contractAddress: contractAddressToUse,
    contractAddresses: [contractAddressToUse],
    fingerprint: null,
  };

  const response = await fetch(getHistoryUrl, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  if (response.status !== 200) {
    console.error("could not fetch;", response.status, response.statusText);
    throw new Error("could not fetch status");
  }
  const { result } = await response.json();

  return result as SuperrareToken;
};

export const toHasSuperrareNft = (
  token: SuperrareToken,
  version: SuperrareContractVersion,
  contractAddress: string | undefined
): Pick<HasSuperrareNft, "token" | "superrareTokenHistory"> => {
  const result = {
    token: {
      metadata: {
        name: token.metadata?.name,
        description: token.description,
        fileType: token.media?.mimeType,
        fileUrl: token.media?.uri,
      },
      creator: toAccount(token.creator),
      owner: toAccount(token.owner),
      tokenId: token.tokenId,
      tokenAddress:
        version !== "custom" ? `superrare-${version}` : contractAddress,
    },
    superrareTokenHistory: {
      auction: token.auction,
      editionNumber: token.editionNumber,
      nftEvents: token.nftEvents,
      currentPrice: token.currentPrice,
      events: token.events,
      totalEditions: token.totalEditions,
    },
  };

  return result;
};

function toAccount(creator: Creator | null): Web3Account | undefined {
  if (!creator) return;

  return {
    address: creator.ethaddress,
    profileImgUrl: creator.avatar,
    userName: creator.username,
  };
}

export const fetchCleanedSuperrareToken = async ({
  tokenId,
  version,
  contractAddress,
}: {
  tokenId: string;
  version: SuperrareContractVersion;
  contractAddress: string | undefined;
}): Promise<Pick<HasSuperrareNft, "superrareTokenHistory" | "token">> => {
  const superrareToken = await getBidHistory(
    +tokenId,
    version,
    contractAddress
  );

  return toHasSuperrareNft(superrareToken, version, contractAddress);
};

const success: NftUpdateStatus = "success";
const failed: NftUpdateStatus = "failed";

export const fetchAndUpdateSuperrareToken = async ({
  fetchData,
  handleUpdates,
}: {
  fetchData: Pick<
    FetchSuperrareTokenAndUpdateNftParams,
    "superrareVersion" | "tokenAddress" | "tokenId" | "nftType"
  > & {
    spaceId: string;
    elementId: string;
  };
  handleUpdates: Forms.UpdateHandlers;
}) => {
  const { superrareVersion = "v2", tokenAddress, tokenId } = fetchData;

  const updateToFailed = (failReason: string | null) => {
    handleUpdates({
      "nft.superrareTokenHistory": null,
      "nft.token": null,
      "nft.updateStatus": failed,
      "nft.failReason": failReason,
    });
    return { success: false };
  };

  const superrareToken = await fetchCleanedSuperrareToken({
    tokenId,
    version: superrareVersion,
    contractAddress: tokenAddress || undefined,
  });

  if (superrareToken.token) {
    const elementName = `${superrareToken.token.creator?.userName} ${superrareToken.token.metadata?.name}`;

    handleUpdates({
      name: elementName,
      "nft.superrareTokenHistory": superrareToken.superrareTokenHistory,
      "nft.token": superrareToken.token,
      "nft.updateStatus": success,
      "nft.nftType": fetchData.nftType,
      "nft.tokenId": fetchData.tokenId,
      "nft.fetchingMedia": true,
    });

    return superrareToken;
  }

  updateToFailed("superrare token was not returned");

  return null;
};
