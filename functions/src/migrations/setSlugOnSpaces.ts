import * as admin from "firebase-admin";
// import { toNamespacedPath } from "path";
process.env.GOOGLE_APPLICATION_CREDENTIALS = "../serviceAccount.json";
process.env.FIRESTORE_EMULATOR_HOST = "localhost:1257";
const communicationUrl = "https://arium-communication.firebaseio.com";

const communicationApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: communicationUrl,
});

const store = communicationApp.firestore();

async function setSlugOnSpaces() {
  const spaces = await store.collection("spaces").get();

  spaces.forEach(async (space) => {
    console.log("setting slug on ", space.id);
    await space.ref.update({
      slug: space.id,
    });
  });
}

setSlugOnSpaces();
