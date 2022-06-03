import * as functions from "firebase-functions";
import { updateSuperrareTokens } from "../../nft/updateSuperrareTokens";
import { store } from "../../db";

const updateSuperrareTokensOnInterval = functions.pubsub
  .schedule("every 15 mins")
  .onRun(async (context) => {
    await updateSuperrareTokens({ store, maxDelay: 5 * 60 });
  });

export default updateSuperrareTokensOnInterval;
