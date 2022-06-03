import * as functions from "firebase-functions";
import { arrayRemove, arrayUnion, auth, store } from "../../db";
import {
  SpaceRoles,
  UpdateSpaceRolesRequest,
  UserAuthClaims,
  UserRoles,
} from "../../../../shared/sharedTypes";
import { getSpaceRolesRef, getUserRolesRef } from "./lib/paths";

export const updateSpaceRoles = functions.https.onCall(
  async (data, context) => {
    const userId = context.auth?.uid;
    if (!userId) throw new Error("must be authorized");

    const { spaceId, toChangeUserId, editor } = data as UpdateSpaceRolesRequest;

    const { admin } = ((await auth().getUser(userId)).customClaims ||
      {}) as UserAuthClaims;

    // TODO: Check if can do this!
    const ownerUserRolesRef = (
      await getUserRolesRef(userId).get()
    ).data() as UserRoles;

    const canAdminUsers = ownerUserRolesRef?.editor?.includes(spaceId) || admin;
    if (!canAdminUsers) throw new Error("does not have access to admin users");

    const spaceRolesRef = getSpaceRolesRef({ spaceId });
    const spaceRoles = (await spaceRolesRef.get()).data() as
      | SpaceRoles
      | undefined;

    const toChangeUserIsOwner = spaceRoles?.owners?.includes(toChangeUserId);

    if (toChangeUserIsOwner)
      throw new Error("user is owner, cannot change its roles");

    const userRolesRef = getUserRolesRef(toChangeUserId);

    // const slug = desiredSlug || newSpaceId;
    const batch = store.batch();

    console.log({
      updating: true,
      spaceRoles,
    });
    if (editor?.add) {
      console.log("adding");
      batch.update(userRolesRef, {
        editor: arrayUnion(spaceId),
      });
      batch.update(spaceRolesRef, {
        editors: arrayUnion(toChangeUserId),
      });
    } else if (editor?.remove) {
      console.log(
        "removing",
        { spaceId, userId },
        userRolesRef.path,
        spaceRolesRef.path
      );
      batch.update(userRolesRef, {
        editor: arrayRemove(spaceId),
      });
      batch.update(spaceRolesRef, {
        editors: arrayRemove(toChangeUserId),
      });
    }

    await batch.commit();

    console.log("after update", (await spaceRolesRef.get()).data());

    return { done: "yes" };
  }
);

export default updateSpaceRoles;
