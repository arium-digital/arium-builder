import * as functions from "firebase-functions";
import { arrayUnion, firestoreTimeNow, increment, store } from "../../db";
import { duplicateSpace } from "./lib/duplicateSpace";
import * as bcrypt from "bcryptjs";
import { generateNewSpaceId, getOrGenerateSlug } from "./lib/getSpace";
import { getSpaceRolesRef, getUserRolesRef } from "./lib/paths";
import {
  CreateSpaceRequest,
  SpaceRoles,
  UserProfile,
} from "../../../../shared/sharedTypes";
import { userProfileDoc } from "../users/dbPaths";

const incrementSpaceCreatedCount = async (userId: string) => {
  const accountDocRef = store.collection("userAccounts").doc(userId);

  console.log("incrementing", accountDocRef.path);

  const accountDoc = await accountDocRef.get();

  if (accountDoc.exists)
    await accountDocRef.update({
      createdSpaces: increment(1),
    });
  else {
    await accountDocRef.set({
      createdSpaces: 1,
    });
  }
};

const hashPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  return hash;
};

export const createSpace = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) throw new Error("must be authorized");

  // TODO: check if user can create a space

  const {
    slug: desiredSlug,
    templateId,
    password,
    ownerId,
  } = data as CreateSpaceRequest;

  let hashedPassword: string | null = null;

  const newSpaceId = await generateNewSpaceId(6);

  const spaceDocRef = store.collection("spaces").doc(newSpaceId);

  const slug: string = await getOrGenerateSlug({ newSpaceId, desiredSlug });

  const newOwnerId = ownerId || userId;

  console.log("creating space with owner ", newOwnerId, { ownerId, userId });

  const userRolesRef = getUserRolesRef(newOwnerId);

  const spaceRolesRef = getSpaceRolesRef({ spaceId: newSpaceId });

  const userProfile = (await userProfileDoc(newOwnerId).get()).data() as
    | UserProfile
    | undefined;
  // const slug = desiredSlug || newSpaceId;

  await store.runTransaction(async (t) => {
    const userRolesDoc = await t.get(userRolesRef);

    spaceDocRef.set({
      ownerId: newOwnerId,
      templateId: templateId || null,
      createdOn: firestoreTimeNow(),
      slug,
    });

    if (!userRolesDoc.exists) {
      t.set(userRolesRef, {
        owner: [newSpaceId],
        editor: [newSpaceId],
        version: 1,
      });
    } else {
      t.update(userRolesRef, {
        owner: arrayUnion(newSpaceId),
        editor: arrayUnion(newSpaceId),
        version: increment(1),
      });
    }

    const spaceRoles: SpaceRoles = {
      owners: [newOwnerId],
      profiles: {
        [newOwnerId]: {
          displayName: userProfile?.displayName || null,
        },
      },
    };

    t.set(spaceRolesRef, spaceRoles);
  });

  console.log("updated roles", (await userRolesRef.get()).data());

  if (password) {
    hashedPassword = hashPassword(password);
    const spaceSecurityDoc = spaceDocRef.collection("settings").doc("security");

    await spaceSecurityDoc.set({
      password: hashedPassword,
      requirePassword: true,
    });
  }

  if (templateId)
    await duplicateSpace({
      newSpaceId,
      spaceId: templateId,
      duplicateMeta: false,
      copySpaceDoc: false,
      duplicateSettings: false,
    });

  if (userId) await incrementSpaceCreatedCount(userId);

  return {
    spaceId: newSpaceId,
    slug,
  };
});

export default createSpace;
