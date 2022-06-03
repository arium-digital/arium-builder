import * as admin from "firebase-admin";
import { auth } from "firebase-admin";
import { UserRecord } from "firebase-functions/v1/auth";
import { SpaceRoleProfile, UserRoles } from "../../../shared/sharedTypes";
// import { toNamespacedPath } from "path";
process.env.GOOGLE_APPLICATION_CREDENTIALS = "../serviceAccount.json";
// process.env.FIRESTORE_EMULATOR_HOST = "localhost:1257";
const communicationUrl = "https://arium-communication.firebaseio.com";

const arrayUnion = admin.firestore.FieldValue.arrayUnion;

const communicationApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: communicationUrl,
});

const store = communicationApp.firestore();

const getDisplayNameFromUser = (user: UserRecord): string | null => {
  return (
    user.displayName ||
    user.email ||
    getNameFromProvider(user.providerData) ||
    null
  );
};

function getNameFromProvider(
  providerData: auth.UserInfo[]
): string | undefined {
  return providerData.find((info) => !!info.displayName)?.displayName;
}

const setSpaceRoles = async () => {
  const userRolesCollection = await store.collection("userRoles").get();

  userRolesCollection.docs.forEach(async (roleDoc) => {
    const role = roleDoc.data() as UserRoles;

    const userId = roleDoc.id;

    const user = await auth().getUser(userId);

    const displayName = getDisplayNameFromUser(user);

    const profile: SpaceRoleProfile = {
      displayName,
    };

    console.log("profile: ", profile);

    const profilesUpdate = {
      [`profiles.${userId}`]: profile,
    };

    for (let editorSpaceId of role.editor || []) {
      const spaceRolesRef = store.collection("spaceRoles").doc(editorSpaceId);

      console.log("setting editor", editorSpaceId);

      await store.runTransaction(async (t) => {
        const existingDoc = await t.get(spaceRolesRef);
        if (existingDoc.exists) {
          t.update(spaceRolesRef, {
            editors: arrayUnion(userId),
            ...profilesUpdate,
          });
        } else {
          t.set(spaceRolesRef, {
            editors: [userId],
            ...profilesUpdate,
          });
        }
      });
    }

    for (let ownerSpaceId of role.owner || []) {
      console.log("setting owner", ownerSpaceId);

      const spaceRolesRef = store.collection("spaceRoles").doc(ownerSpaceId);

      await store.runTransaction(async (t) => {
        const existingDoc = await t.get(spaceRolesRef);
        if (existingDoc.exists) {
          t.update(spaceRolesRef, {
            owners: arrayUnion(userId),
            ...profilesUpdate,
          });
        } else {
          t.set(spaceRolesRef, {
            owners: [userId],
            ...profilesUpdate,
          });
        }
      });
    }
  });
};

setSpaceRoles();
