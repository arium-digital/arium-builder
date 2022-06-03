import * as functions from "firebase-functions";
import {
  AcceptSpaceInviteRequest,
  SpaceInvite,
  SpaceRoleProfile,
  SpaceRoles,
  UserProfile,
} from "../../../../shared/sharedTypes";
import { arrayUnion, increment, store } from "../../db";
import { userProfileDoc } from "../users/dbPaths";
import { getSpaceRolesRef, getUserRolesRef } from "./lib/paths";

const spaceInvitesCollection = (spaceId: string) =>
  store.collection("spaces").doc(spaceId).collection("spaceInvites");

const spaceInvitePath = ({
  spaceId,
  inviteId,
}: {
  spaceId: string;
  inviteId: string;
}) => spaceInvitesCollection(spaceId).doc(inviteId);

const claimInviteAndMakeUserEditorOfSpace = async ({
  spaceId,
  userId,
  inviteId,
}: {
  spaceId: string;
  userId: string;
  inviteId: string;
}) => {
  const userRolesRef = getUserRolesRef(userId);

  const spaceRolesRef = getSpaceRolesRef({ spaceId });

  const userProfile = (await userProfileDoc(userId).get()).data() as
    | UserProfile
    | undefined;

  await store.runTransaction(async (t) => {
    const userRolesDoc = await t.get(userRolesRef);
    const spaceRolesDoc = await t.get(spaceRolesRef);

    if (!userRolesDoc.exists) {
      t.set(userRolesRef, {
        editor: [spaceId],
        version: 1,
      });
    } else {
      t.update(userRolesRef, {
        editor: arrayUnion(spaceId),
        version: increment(1),
      });
    }

    const profileUpdate: SpaceRoleProfile = {
      displayName: userProfile?.displayName || null,
    };
    if (!spaceRolesDoc.exists) {
      const spaceRoles: SpaceRoles = {
        editors: [userId],
        profiles: {
          [userId]: profileUpdate,
        },
      };
      t.set(spaceRolesRef, spaceRoles);
    } else {
      t.update(spaceRolesRef, {
        editors: arrayUnion(userId),
        [`profiles.${userId}`]: profileUpdate,
      });
    }

    const update: Partial<SpaceInvite> = {
      claimed: true,
      pending: false,
      claimedByUserId: userId,
    };
    t.update(spaceInvitePath({ spaceId, inviteId }), update);
  });

  const spaceRolesDoc = (await userRolesRef.get()).data();

  console.log("done with new roles", spaceRolesDoc);
};

export const acceptSpaceInvitation = functions.https.onCall(
  async (data, context) => {
    const userId = context.auth?.uid;
    if (!userId) throw new Error("must be authorized");

    const { spaceId, inviteId } = data as AcceptSpaceInviteRequest;

    const spaceInviteDoc = await spaceInvitePath({ spaceId, inviteId }).get();

    if (!spaceInviteDoc.exists) throw new Error("Invalid space invite id");

    const spaceInvite = spaceInviteDoc.data() as SpaceInvite;

    const alreadyClaimed = !spaceInvite.pending;
    if (alreadyClaimed) {
      // if already claimed but by same user, assume they clicked twice and continue.
      if (spaceInvite.claimedByUserId === userId) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: "Invite has already been claimed.",
        };
      }
    } else {
      await claimInviteAndMakeUserEditorOfSpace({
        spaceId,
        userId,
        inviteId,
      });

      return {
        success: true,
      };
    }
  }
);

export default acceptSpaceInvitation;
