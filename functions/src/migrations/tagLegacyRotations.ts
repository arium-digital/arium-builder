import * as admin from "firebase-admin";

// process.env.FIRESTORE_EMULATOR_HOST = "localhost:1256"
process.env.GOOGLE_APPLICATION_CREDENTIALS = "../serviceAccount.json";

const communicationUrl = "https://arium-communication.firebaseio.com";

const communicationApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: communicationUrl,
});

const tagLegacyRotations = async () => {
  const store = communicationApp.firestore();

  let data = await store
    .collectionGroup("elementsTree")
    .where("elementType", "in", ["image"])
    .get();

  data.forEach(async (doc) => {
    await doc.ref.update({
      "image.legacyRotation": true,
    });
  });

  data = await store
    .collectionGroup("elementsTree")
    .where("elementType", "in", ["video", "screen share"])
    .get();

  data.forEach(async (doc) => {
    await doc.ref.update({
      "video.legacyRotation": true,
      "screenShare.legacyRotation": true,
    });
  });

  data = await store
    .collectionGroup("elementsTree")
    .where("elementType", "in", ["reflectorSurface"])
    .get();

  data.forEach(async (doc) => {
    await doc.ref.update({
      "reflectorSurface.legacyRotation": true,
    });
  });

  console.log("done");
};

tagLegacyRotations();
