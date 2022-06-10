import * as functions from "firebase-functions";
import { admin } from "../../db";
import { Space } from "../../../../shared/sharedTypes";

const removeOwnerTokenFromSpaceCreator = async ({
  spaceId,
  userId,
}: {
  spaceId: string;
  userId: string;
}) => {
  console.log("removing user owner claims", { spaceId, userId });

  const existingClaim = (await admin.auth().getUser(userId)).customClaims || {};

  const updateSpaceOwner = existingClaim.spaceOwner || {};

  delete updateSpaceOwner[spaceId];

  const updatedClaim = {
    ...existingClaim,
    spaceOwner: updateSpaceOwner,
  };

  console.log("updating claims", updatedClaim);

  await admin.auth().setCustomUserClaims(userId, updatedClaim);
};

// THIS IS OUT OF DATE:
// ToDo: remove claims from firebase storage doc.

const spaceDeleted = functions.firestore
  .document("spaces/{spaceId}")
  .onDelete(async (snapshot, ctx) => {
    const spaceId = ctx.params.spaceId as string;

    const space = snapshot.data() as Space;

    process.env.GCLOUD_PROJECT = "volta-events-294715";

    const userId = space.ownerId;
    if (userId) {
      await removeOwnerTokenFromSpaceCreator({ spaceId, userId });
      // TODO: clear space owner from record
    }
  });

export default spaceDeleted;
