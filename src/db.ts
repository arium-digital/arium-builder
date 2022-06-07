import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/database";
import "firebase/storage";
import "firebase/functions";

/*
 * // Retrieve your own options values by adding a web app on
 * // https://console.firebase.google.com
 * firebase.initializeApp({
 *   apiKey: "AIza....",                             // Auth / General Use
 *   appId: "1:27992087142:web:ce....",              // General Use
 *   projectId: "my-firebase-project",               // General Use
 *   authDomain: "YOUR_APP.firebaseapp.com",         // Auth with popup/redirect
 *   databaseURL: "https://YOUR_APP.firebaseio.com", // Realtime Database
 *   storageBucket: "YOUR_APP.appspot.com",          // Storage
 *   messagingSenderId: "123456789",                 // Cloud Messaging
 *   measurementId: "G-12345"                        // Analytics
 * });
 * `
 */

// Replace the below with configuration from your project.
const firebaseConfig = {
  apiKey: "AIzaSyAoPz3c-2OHJzl9qPy6IzzSlROHIUeAvS4",
  authDomain: "arium-builder-example.firebaseapp.com",
  databaseURL: "https://arium-builder-example-default-rtdb.firebaseio.com",
  projectId: "arium-builder-example",
  storageBucket: "arium-builder-example.appspot.com",
  messagingSenderId: "346607153918",
  appId: "1:346607153918:web:105d693144732ee7a22baf",
};

const firebaseApp = !firebase.apps.length
  ? firebase.initializeApp({
      ...firebaseConfig,
    })
  : firebase.app();

const store = firebase.firestore();

const realtimeDb = firebaseApp.database();

if (process.env.NEXT_PUBLIC_DB_EMULATOR_PORT) {
  realtimeDb.useEmulator(
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

export { realtimeDb, store };
export declare type DocumentRef = Omit<
  firebase.firestore.DocumentReference,
  "listCollections" | "create"
>;
