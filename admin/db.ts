import * as admin from "firebase-admin";
////////////////////////////////////////////////////////////////
// Firestore

// [START initialize_app]

process.env.GOOGLE_APPLICATION_CREDENTIALS = "../serviceAccount.json";
// process.env.FIRESTORE_EMULATOR_HOST = "localhost:1257";
// process.env.GCLOUD_PROJECT = "volta-events-294715";

const communicationUrl = "https://arium-communication.firebaseio.com";

export const communicationApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: communicationUrl,
});

const store = admin.firestore();

export { store };
