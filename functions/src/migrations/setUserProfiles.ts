import * as admin from "firebase-admin";
import { UserProfile } from "../../../shared/sharedTypes";
// import { toNamespacedPath } from "path";
process.env.GOOGLE_APPLICATION_CREDENTIALS = "../serviceAccount.json";
// process.env.FIRESTORE_EMULATOR_HOST = "localhost:1257";
const communicationUrl = "https://arium-communication.firebaseio.com";

const communicationApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: communicationUrl,
});

const store = communicationApp.firestore();

let allUpdates: {
  userProfile: UserProfile;
  userId: string;
}[] = [];

const getUserProfiles = async (nextPageToken: string | undefined) => {
  console.log("migrating next page token", nextPageToken);
  // List batch of users, 1000 at a time.

  const listUsersResult = await communicationApp
    .auth()
    .listUsers(1000, nextPageToken);
  listUsersResult.users.forEach(async (userRecord) => {
    //  if (userRecord.)

    if (userRecord.photoURL || userRecord.displayName) {
      const isAnonymous = userRecord.providerData.length === 0;
      console.log({
        length: userRecord.providerData.length,
        anon: isAnonymous,
      });
      if (!isAnonymous) {
        allUpdates.push({
          userId: userRecord.uid,
          userProfile: {
            photoURL: userRecord.photoURL || null,
            displayName: userRecord.displayName || null,
          },
        });

        console.log({
          photoURL: userRecord.photoURL || null,
          displayName: userRecord.displayName || null,
        });
      }
    }

    // console.log({'email': userRecord.email, claims: userRecord.customClaims});
  });
  if (listUsersResult.pageToken) {
    // List next batch of users.
    await getUserProfiles(listUsersResult.pageToken);
  } else {
    console.log("done");
  }
};

async function setProfileOnUsers() {
  await getUserProfiles(undefined);

  allUpdates.forEach(async (update) => {
    const profileDoc = store.collection("userProfiles").doc(update.userId);

    await store.runTransaction(async (t) => {
      const existingDoc = await t.get(profileDoc);

      if (!existingDoc.exists) {
        console.log("nothing existing....setting");
        profileDoc.set(update.userProfile);
      } else {
        const existingData = existingDoc.data() as Partial<UserProfile>;

        if (
          existingData.displayName !== update.userProfile.displayName ||
          existingData.photoURL !== update.userProfile.photoURL
        ) {
          console.log("updating since changed");

          profileDoc.update(update.userProfile);
        }
      }
    });
  });
}

setProfileOnUsers();
