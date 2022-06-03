import * as admin from "firebase-admin";
import { UserAuthClaims } from "../shared/sharedTypes";
import { store } from "./db";

export const getUserWithEmailOrId = async (emailOrUserId: string) => {
  let userWithEmailOrId: admin.auth.UserRecord;

  try {
    userWithEmailOrId = await admin.auth().getUserByEmail(emailOrUserId);
  } catch (e) {
    try {
      userWithEmailOrId = await admin.auth().getUser(emailOrUserId);
    } catch (e) {
      console.error("could not find user with email or user id", emailOrUserId);

      throw e;
    }
  }

  return userWithEmailOrId;
};

export const makeUserAdmin = async (email: string) => {
  const userWithEmail = await getUserWithEmailOrId(email);

  await store.collection("spaceRoles").doc(userWithEmail.uid).set({
    admin: true,
  });

  const updatedClaim: UserAuthClaims = {
    ...userWithEmail.customClaims,
    admin: true,
  };

  await admin.auth().setCustomUserClaims(userWithEmail.uid, updatedClaim);
  // The new custom claims will propagate to the user's ID token the
  // next time a new one is issued.

  const user = await admin.auth().getUser(userWithEmail.uid);

  console.log("users claims", user.customClaims);

  console.log("done");
};
