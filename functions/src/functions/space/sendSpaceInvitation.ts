import * as functions from "firebase-functions";
import { firestoreTimeNow, increment, store } from "../../db";
import { Space } from "../../../../shared/sharedTypes";
import { SpaceMeta } from "../../../../shared/spaceMeta";
import { getMetaImagePath } from "../../../../src/media/assetPaths";

const createAcceptInviteUrl = ({
  spaceSlug,
  inviteId,
}: {
  spaceSlug: string;
  inviteId: string;
}) => `https://www.arium.xyz/spaces/${spaceSlug}?invite=${inviteId}`;

async function getSpaceInfo(spaceId: string) {
  const spaceDoc = (
    await store.collection("spaces").doc(spaceId).get()
  ).data() as Space;
  const spaceMeta = (
    await store
      .collection("spaces")
      .doc(spaceId)
      .collection("settings")
      .doc("meta")
      .get()
  ).data() as SpaceMeta | undefined;

  const spaceName = spaceMeta?.name || (spaceDoc.slug as string);

  const metaImage = (spaceMeta?.metaImage
    ? getMetaImagePath(spaceMeta.metaImage)
    : "https://arium.xyz/images/meta-image.png") as string;

  return {
    spaceName,
    metaImage,
    slug: spaceDoc?.slug,
  };
}

const sendSpaceInvitation = functions.firestore
  .document("spaces/{spaceId}/spaceInvites/{inviteId}")
  .onCreate(async (snap, context) => {
    const spaceId = context.params.spaceId as string;
    const inviteId = context.params.inviteId as string;

    const spaceInfo = await getSpaceInfo(spaceId);

    if (!spaceInfo.slug) throw new Error("missing space slug");

    const inviteUrl = createAcceptInviteUrl({
      spaceSlug: spaceInfo.slug,
      inviteId,
    });

    await snap.ref.update({
      sent: true,
      lastSentTime: firestoreTimeNow(),
      sendCount: increment(1),
      inviteUrl,
    });
  });

export default sendSpaceInvitation;
