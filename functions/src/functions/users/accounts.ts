import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { store } from "../../db";
import { UserProfile } from "../../../../shared/sharedTypes";
import { userProfileDoc } from "./dbPaths";
import { auth } from "firebase-admin";

// https://ilikekillnerds.com/2020/08/how-to-store-users-in-firestore-using-firebase-authentication/
export const createUserProfile = functions.auth
  .user()
  .onCreate(async (user) => {
    const { uid, displayName, email, photoURL } = user;

    console.log("create profile call", {
      displayName,
      photoURL,
      email,
    });

    if (displayName || email || photoURL) {
      // refetch user to get proper name since sometimes its no there at the start;
      return new Promise<void>((resolve) => {
        // hack - need to wait some time before getting profile becuase it could have changed.
        setTimeout(async () => {
          const user = await auth().getUser(uid);
          const userProfile: UserProfile = {
            displayName: user.displayName || null,
            // email: email || null,
            photoURL: user.photoURL || null,
          };

          console.log("creating profile", userProfile);
          userProfileDoc(uid).set(userProfile);
          resolve();
        }, 1000);
      });
    } else {
      console.log("no uid or email, not creating");
    }

    return null;
  });

export const updateUserProfile = functions.firestore
  .document("userProfiles/{userId}")
  .onUpdate(async (snapshot, context) => {
    console.log("updating profile");
    const updateRequest = snapshot.after.data() as Partial<UserProfile>;

    const userId = snapshot.after.id;

    const update: Partial<UserProfile> = {};

    if (updateRequest.displayName) {
      update.displayName = updateRequest.displayName;
    }
    if (updateRequest.photoURL) {
      update.photoURL = updateRequest.photoURL;
    }

    console.log("updating user: ", update);

    await admin.auth().updateUser(userId, update);
  });

export const createUserAccount = functions.auth.user().onCreate((user) => {
  const { emailVerified } = user;

  return store.collection("userAccounts").doc(user.uid).set({ emailVerified });
});

export const deleteUserProfile = functions.auth.user().onDelete((user) => {
  admin.initializeApp();
  return admin.firestore().collection("users").doc(user.uid).delete();
});
