import * as admin from "firebase-admin";
import randomString = require("random-string");
process.env.GOOGLE_APPLICATION_CREDENTIALS = "../serviceAccount.json";
process.env.FIREBASE_DATABASE_EMULATOR_HOST = "localhost:9000";
process.env.FIRESTORE_EMULATOR_HOST = "localhost:1256";

const serverTime = () => admin.database.ServerValue.TIMESTAMP;
const communicationUrl = "https://arium-communication.firebaseio.com";

const communicationApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: communicationUrl,
});

const communicationDb = communicationApp.database();

const testSessions = async () => {
  const sessionId = randomString(8);
  console.log("inserting into sessions", sessionId);
  const ref = communicationDb.ref(`userSessions/${sessionId}`);
  await ref.set({
    active: true,
    spaceId: "home",
    userId: "crut",
    lastUpdated: serverTime(),
  });

  console.log("inserted");

  await ref.update({
    active: true,
    lastUpdated: serverTime(),
  });

  console.log("updated");
};

testSessions();
