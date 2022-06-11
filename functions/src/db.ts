import * as admin from "firebase-admin";
import { firebaseConfig } from "../../src/config";

const communicationUrl = "https://arium-communication.firebaseio.com";

const communicationApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: communicationUrl,
});

const store = communicationApp.firestore();
store.settings({ ignoreUndefinedProperties: true });

export const firestoreTimeNow = () =>
  admin.firestore.FieldValue.serverTimestamp();
export const arrayUnion = admin.firestore.FieldValue.arrayUnion;
export const arrayRemove = admin.firestore.FieldValue.arrayRemove;
export const increment = admin.firestore.FieldValue.increment;

export declare type Reference = admin.database.Reference;

export declare type QuerySnapshot = FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;

const app = communicationApp;
const firestore = admin.firestore;
const auth = admin.auth;
export declare type DocumentReference = FirebaseFirestore.DocumentReference;

export const storage = () => app.storage();
export { admin, store, app, firestore, auth, firebaseConfig };
