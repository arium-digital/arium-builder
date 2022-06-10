import * as functions from "firebase-functions";
import { fetchCleanedSuperrareToken } from "../../nft/fetchAndUpdateSuperrarTokenIfChanged";
import {
  FetchOpenSeaTokenAndUpdateNftParams,
  FetchSuperrareTokenAndUpdateNftParams,
  FetchTezosTokenAndUpdateNftParams,
  FetchTokenAndUpdateNftParams,
  HasNft,
  NftUpdateStatus,
  Token,
} from "../../../../shared/nftTypes";
import { fetchOpenSeaAsset } from "../../nft/lib/opensea";
import { store } from "../../db";
import { fetchAccount, fetchTokenInfo } from "../../nft/lib/tezos";
import { logError } from "../errorHandling";
import {
  updateTezosTokenFromMetadata,
  updateTokenFromMetadata,
} from "./updateTokenMedia";
import { TezosTokenDetailsV2 } from "../../../../shared/nftTypes/tezos";

const isSuperrareTokenRequest = (
  values: FetchTokenAndUpdateNftParams
): values is FetchSuperrareTokenAndUpdateNftParams => {
  return values.nftType === "superrare";
};
const isEthTokenRequest = (
  values: HasNft
): values is FetchOpenSeaTokenAndUpdateNftParams => {
  return values.nftType === "opensea" || values.nftType === "ethereum";
};

const isTezosTokenRequest = (
  values: HasNft
): values is FetchTezosTokenAndUpdateNftParams => {
  return values.nftType === "tezos";
};

const fetchTokenAndUpdateNft = functions
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 300,
    memory: "2GB",
  })
  .https.onCall(async (fetchData: FetchTokenAndUpdateNftParams, context) => {
    const userId = context.auth?.uid;
    if (!userId) throw new Error("must be authorized");

    const { spaceId, elementId } = fetchData as {
      spaceId?: string;
      elementId?: string;
    };

    if (!spaceId || !elementId)
      throw new Error("spaceId and elementId are required");

    const elementDocRef = store
      .collection("spaces")
      .doc(spaceId)
      .collection("elementsTree")
      .doc(elementId);

    const failed: NftUpdateStatus = "failed";
    const success: NftUpdateStatus = "success";

    const result = await store.runTransaction(async (t) => {
      const updateToFailed = (failReason: string | null) => {
        t.update(elementDocRef, {
          "nft.superrareTokenHistory": null,
          "nft.token": null,
          "nft.updateStatus": failed,
          "nft.failReason": failReason,
        });
        return { success: false };
      };

      if (!fetchData.nftType) {
        return updateToFailed("invalid request");
      }
      const { tokenId } = fetchData;
      if (!tokenId) {
        return updateToFailed("invalid request - missing tokenId");
      }

      try {
        if (isSuperrareTokenRequest(fetchData)) {
          const { superrareVersion = "v2", tokenAddress } = fetchData;

          console.log({ fetchData });
          const superrareToken = await fetchCleanedSuperrareToken({
            tokenId,
            version: superrareVersion,
            contractAddress: tokenAddress || undefined,
          });

          if (superrareToken.token) {
            const elementName = `${superrareToken.token.creator?.userName} ${superrareToken.token.metadata?.name}`;

            t.update(elementDocRef, {
              name: elementName,
              "nft.superrareTokenHistory": superrareToken.superrareTokenHistory,
              "nft.token": superrareToken.token,
              "nft.updateStatus": success,
              "nft.nftType": fetchData.nftType,
              "nft.tokenId": fetchData.tokenId,
              "nft.fetchingMedia": true,
            });

            console.log("updated token");

            return superrareToken;
          }

          return updateToFailed("superrare token was not returned");
        }
        if (isEthTokenRequest(fetchData)) {
          const { tokenId, tokenAddress } = fetchData;

          if (!tokenId || !tokenAddress) {
            return updateToFailed(
              "invalid request - missing tokenId or tokenAddress"
            );
          }

          const openseaToken = await fetchOpenSeaAsset({
            tokenId,
            tokenAddress,
          });

          if (openseaToken.token) {
            const elementName = `${openseaToken.token.creator?.userName} - ${openseaToken.token.metadata?.name}`;

            t.update(elementDocRef, {
              name: elementName,
              "nft.token": openseaToken.token,
              "nft.updateStatus": success,
              "nft.fetchingMedia": true,
              "nft.tokenId": fetchData.tokenId,
              "nft.nftType": fetchData.nftType,
            });

            return openseaToken;
          }

          return updateToFailed("opensea token was not returned");
        }
        if (isTezosTokenRequest(fetchData)) {
          const { contractAddress, tokenId } = fetchData;

          console.log("fetching tezos token", {
            tokenId,
            contractAddress,
          });

          if (!tokenId || !contractAddress) {
            return updateToFailed(
              "invalid request - missing tokenId or contract address"
            );
          }

          const tezosObjkt = await fetchTokenInfo(tokenId, contractAddress);

          const firstObjkt = tezosObjkt[0];
          if (firstObjkt) {
            // const ipfsAddress = firstObjkt.artifact_uri;
            // const fileType = firstObjkt.formats[0].mimeType;
            // const fileUrl = ipfsToUrl(ipfsAddress);

            const creators = await Promise.all(
              firstObjkt.metadata.creators.map((creator) =>
                fetchAccount(creator)
              )
            );

            const firstCreator = creators[0];

            const name = firstCreator?.alias
              ? `${firstCreator.alias} - ${firstObjkt.metadata.name}`
              : firstObjkt.metadata.name;

            const update = {
              name: name,
              "nft.tezosToken": firstObjkt,
              "nft.tezosCreators": creators,
              "nft.updateStatus": success,
              "nft.tokenId": fetchData.tokenId,
              "nft.nftType": fetchData.nftType,
              "nft.fetchingMedia": true,
            };

            t.update(elementDocRef, update);

            console.log("updated tezos token", update);

            return {
              tezosObjkt: firstObjkt,
            };
          }

          logError(new Error("tezos token was not returned"));

          return updateToFailed("tezos token was not returned");
        }
        return updateToFailed("invalid request - unkown nft type");
      } catch (e: any) {
        console.error(e);
        return updateToFailed(e.toString());
      }
    });

    // @ts-ignore
    const token = result.token as Token | undefined;
    if (token && token.tokenAddress) {
      console.log("updating media", {
        address: token.tokenAddress,
      });
      await updateTokenFromMetadata(
        token as Token,
        elementDocRef,
        token.tokenAddress
      );
    }

    // @ts-ignore
    const tezosObjkt = result.tezosObjkt as TezosTokenDetailsV2 | undefined;
    if (tezosObjkt) {
      await updateTezosTokenFromMetadata(tezosObjkt, elementDocRef);
    }

    console.log("done!!!");

    return result;
  });

export default fetchTokenAndUpdateNft;
