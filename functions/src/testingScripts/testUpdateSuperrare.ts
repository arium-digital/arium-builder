import { updateSuperrareTokens } from "../nft/updateSuperrareTokens";
import * as admin from "firebase-admin";
// import { toNamespacedPath } from "path";
process.env.GOOGLE_APPLICATION_CREDENTIALS = "../serviceAccount.json";
// process.env.FIREBASE_DATABASE_EMULATOR_HOST="host.docker.internal:9000"
const communicationUrl = "https://arium-communication.firebaseio.com";

const communicationApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: communicationUrl,
});

export const communicationDb = communicationApp.database();

const store = communicationApp.firestore();

const runUpdate = async () => {
  await updateSuperrareTokens({ store });
};

runUpdate();
