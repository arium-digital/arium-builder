import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/database";
import "firebase/storage";
import "firebase/functions";

export const firebaseConfig = {
  apiKey: "AIzaSyAAt0MULwXlRJiMq4V2_LE7mUIre1Na94M",
  authDomain: "volta-events-294715.firebaseapp.com",
  projectId: "volta-events-294715",
  storageBucket: "volta-events-294715.appspot.com",
  messagingSenderId: "309430825062",
  appId: "1:309430825062:web:4c42eaec39b1b719c17da7",
};

const communicationUrl = "https://arium-communication.firebaseio.com";

// Initialize Firebase
const communicationApp = !firebase.apps.length
  ? firebase.initializeApp({
      ...firebaseConfig,
    })
  : firebase.app();

const store = firebase.firestore();

const communicationDb = communicationApp.database(communicationUrl);

if (process.env.NEXT_PUBLIC_DB_EMULATOR_PORT) {
  communicationDb.useEmulator(
    "localhost",
    +process.env.NEXT_PUBLIC_DB_EMULATOR_PORT
  );
}

export const auth = firebase.auth;

export const functions = firebase.functions;

export declare type Storage = firebase.storage.Storage;
export declare type Reference = firebase.storage.Reference;

if (process.env.NEXT_PUBLIC_FUNCTIONS_PORT) {
  functions().useEmulator("localhost", +process.env.NEXT_PUBLIC_FUNCTIONS_PORT);
}

export const signInAnonymously = () => auth().signInAnonymously();

export const serverTime = () => firebase.database.ServerValue.TIMESTAMP;
export const firestoreTimeNow = () =>
  firebase.firestore.FieldValue.serverTimestamp();
export const firestoreDelete = () => firebase.firestore.FieldValue.delete();
export const storage = () => firebase.storage();

export declare type Timestamp = firebase.firestore.Timestamp;

if (process.env.NEXT_PUBLIC_STORE_EMULATOR_PORT) {
  console.log(
    "using emulator for store",
    process.env.NEXT_PUBLIC_STORE_EMULATOR_PORT
  );
  store.useEmulator("localhost", +process.env.NEXT_PUBLIC_STORE_EMULATOR_PORT);
}

export declare type DataSnapshot = firebase.database.DataSnapshot;
export declare type DatabaseReference = firebase.database.Reference;
export declare type User = firebase.User;

export declare type DocumentReference = firebase.firestore.DocumentReference;

export const increment = firebase.firestore.FieldValue.increment;

export { communicationDb, store };
export declare type DocumentRef = Omit<
  firebase.firestore.DocumentReference,
  "listCollections" | "create"
>;
