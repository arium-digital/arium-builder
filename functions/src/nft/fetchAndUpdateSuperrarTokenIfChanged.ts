import { isEqual } from "lodash";
import { HasSuperrareNft } from "../../../shared/nftTypes";
import { SuperrareContractVersion } from "../../../shared/nftTypes/superrare";
import { DocumentReference } from "../db";
import { logError } from "../functions/errorHandling";
import { toHasSuperrareNft, getBidHistory } from "./lib/superrare";

export interface ElementConfig {
  name?: string;
  active?: boolean;
  deleted?: boolean;
  parentId?: string;
}

export interface TokenElementConfig extends ElementConfig {
  nft?: HasSuperrareNft;
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

export const fetchAndUpdateSuperrareTokenHistoryIfChanged = async ({
  config,
  ref,
  spaceId,
}: {
  config: TokenElementConfig;
  ref: DocumentReference;
  spaceId?: string;
}) => {
  const tokenId = config.nft?.tokenId;
  const version = config.nft?.superrareVersion || "v2";

  if (!tokenId) {
    console.error(`no token set for element ${config.name}`);
    return;
  }

  console.log("fetching for token", {
    tokenId,
    version,
  });

  const simplifiedToken = await fetchCleanedSuperrareToken({
    tokenId,
    version,
    contractAddress: config.nft?.tokenAddress,
  });

  const existingTokenHistory = config.nft?.superrareTokenHistory;

  const shouldUpdate =
    !existingTokenHistory ||
    !isEqual(simplifiedToken.superrareTokenHistory, existingTokenHistory);

  if (shouldUpdate) {
    console.log(
      `changed, so updating ${simplifiedToken?.token?.metadata?.name}`
    );
    try {
      await ref.update({
        "nft.superrareTokenHistory": simplifiedToken.superrareTokenHistory,
      });
    } catch (e) {
      console.error(e);
      logError(new Error(`failed to update token ${tokenId}`));
    }
  }
};
const maxDepth = 4;
export async function isInactiveOrDeleted(
  config: ElementConfig,
  ref: DocumentReference,
  depth = 0,
  activeRegistry: { [elementId: string]: boolean }
): Promise<boolean> {
  // prevent super deep recursion
  const { active, deleted, parentId } = config;
  const getDeletedOrInactive = async () => {
    if (maxDepth === depth) return false;
    if (!active || deleted) return true;

    if (!parentId) return false;

    // we can pull from cache the parent, so use it
    if (typeof activeRegistry[parentId] !== undefined) {
      const parentInactiveOrDeleted = activeRegistry[parentId];
      return parentInactiveOrDeleted;
    }

    const parentRef = ref.parent.doc(parentId);

    const parentDoc = (await parentRef.get()).data() as ElementConfig;

    const parentInactiveOrDeleted = await isInactiveOrDeleted(
      parentDoc,
      ref,
      (depth = depth + 1),
      activeRegistry
    );

    return parentInactiveOrDeleted;
  };

  const deletedOrInactive = await getDeletedOrInactive();

  // used to prevent double lookup
  activeRegistry[ref.id] = deletedOrInactive;

  return deletedOrInactive;
}
