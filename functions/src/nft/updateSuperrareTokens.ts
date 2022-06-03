// import { from, timer } from "rxjs";
// import { concatAll, mergeMap } from "rxjs/operators";

import {
  fetchAndUpdateSuperrareTokenHistoryIfChanged,
  isInactiveOrDeleted,
  TokenElementConfig,
} from "./fetchAndUpdateSuperrarTokenIfChanged";

export const updateSuperrareTokens = async ({
  store,
  maxDelay = 120,
}: {
  store: FirebaseFirestore.Firestore;
  maxDelay?: number;
}) => {
  const tokenElements = await store
    .collectionGroup("elementsTree")
    .where("elementType", "==", "nft")
    .where("nft.nftType", "==", "superrare")
    .get();

  const activeRegistry: { [id: string]: boolean } = {};

  const tokensAndActive = (
    await Promise.all(
      tokenElements.docs.map(async (doc) => {
        const config = doc.data() as TokenElementConfig;

        return {
          doc,
          config,
          deleted: await isInactiveOrDeleted(
            config,
            doc.ref,
            0,
            activeRegistry
          ),
        };
      })
    )
  ).filter((x) => !x.deleted);

  console.log("number docs", {
    total: tokenElements.size,
    active: tokensAndActive.length,
  });

  const result = tokensAndActive.map(({ config, doc }, index) => {
    const toDelay = (index / tokensAndActive.length) * maxDelay;

    // console.log(toDelay);

    // console.log({ toDelay, maxDelay });
    const toDelayMs = Math.round(toDelay * 1000);
    // distribute calls to not get rate limited.

    return new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        try {
          await fetchAndUpdateSuperrareTokenHistoryIfChanged({
            spaceId: doc.ref.parent.parent?.id,
            config,
            ref: doc.ref,
          });
        } catch (e) {
          console.error(e);
        }

        resolve();
      }, toDelayMs);
    });
  });
  await Promise.all(result);
};
