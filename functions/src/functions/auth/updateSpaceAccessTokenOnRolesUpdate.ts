import * as functions from "firebase-functions";
import { UserRoles, UserAuthClaims } from "../../../../shared/sharedTypes";
import { admin } from "../../db";

/**
 * When roles are updated, updates the auth claims to
 * match the space roles so that it can write to the firebase storage
 */
const updateSpaceAccessTokenOnRolesUpdate = functions.firestore
  .document("userRoles/{userId}")
  .onWrite(async (change, ctx) => {
    const userId = ctx.params.userId as string;
    // const spaceId = ctx.params.spaceId as string;

    const roles = change.after.data() as UserRoles;
    // console.log("updating claims for", { userId, spaceId, roles });

    process.env.GCLOUD_PROJECT = "volta-events-294715";

    const allSpaces = new Set([
      ...(roles.editor || []),
      ...(roles.owner || []),
    ]);

    const existingClaim = ((await admin.auth().getUser(userId)).customClaims ||
      {}) as UserAuthClaims;
    console.log("existing claims", existingClaim);

    const updatedClaim: UserAuthClaims = {
      // todo: when this PR is done, clear out old auth token things
      ...existingClaim,
      spaces: roles.admin ? [] : Array.from(allSpaces),
      admin: roles.admin,
      v: roles.version,
    };

    await admin.auth().setCustomUserClaims(userId, updatedClaim);

    console.log(
      "updated claims",
      (await admin.auth().getUser(userId)).customClaims
    );
  });

export default updateSpaceAccessTokenOnRolesUpdate;
