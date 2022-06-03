import * as admin from "firebase-admin";

// process.env.FIRESTORE_EMULATOR_HOST = "localhost:1256";
process.env.GOOGLE_APPLICATION_CREDENTIALS = "../serviceAccount.json";

const communicationUrl = "https://arium-communication.firebaseio.com";

const communicationApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: communicationUrl,
});

const tagLegacyScale = async () => {
  const store = communicationApp.firestore();

  let data = await store
    .collectionGroup("elementsTree")
    .where("elementType", "in", ["text"])
    .get();

  data.forEach(async (doc) => {
    await doc.ref.update({
      "text.legacyFontScale": 0.01,
    });
  });

  console.log("done");
};

tagLegacyScale();
