// import Web3 from "web3";
// import { OpenSeaPort, Network } from "opensea-js";
// import { getAssetWithToken } from "./openseaApi";

import { HasEthNft, Web3Account } from "../../../../shared/nftTypes";
import { OpenSeaAccount } from "../../../../shared/nftTypes/opensea";
import { getAssetWithTokenMetadata } from "./openseaApi";

// // This example provider won't let you make transactions, only read-only calls:
// const provider = new Web3.providers.HttpProvider("https://mainnet.infura.io");

// const seaport = new OpenSeaPort(provider, {
//   networkName: Network.Main,
// });

type FetchAssetResponse = Pick<HasEthNft, "token">;

export const fetchOpenSeaAsset = async ({
  tokenId,
  tokenAddress,
}: {
  tokenId: string | null;
  tokenAddress: string;
}): Promise<FetchAssetResponse> => {
  if (!tokenId) throw new Error("Token id required");
  const asset = await getAssetWithTokenMetadata({
    tokenId,
    tokenAddress,
  });

  console.log({ fileurl: asset.fileUrl /*, asset*/ });
  // const {version, externalLink, openseaLink, owner, traits, image } = asset;

  const result: FetchAssetResponse = {
    token: {
      metadata: {
        description: asset.description,
        fileType: asset.fileType,
        fileUrl: asset.fileUrl,
        name: asset.name,
      },
      creator: parseAccount(asset.creator),
      owner: parseAccount(asset.owner),
      tokenId,
      tokenAddress,
      openSeaLink: asset.openseaLink,
      externalLink: asset.externalLink,
      collectionName: asset.collection?.name,
      tokenMetadata: asset.tokenMetadata,
    },
  };

  return result;
};

function parseAccount(
  creator: OpenSeaAccount | undefined
): Web3Account | undefined {
  if (!creator) return undefined;

  return {
    address: creator.address,
    profileImgUrl: creator.profileImgUrl,
    userName: creator.user?.username,
  };
}
