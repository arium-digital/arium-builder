import * as functions from "firebase-functions";
import sgMail from "@sendgrid/mail";
import { firestoreTimeNow, increment, store } from "../../db";
import {
  Space,
  SpaceInvite,
  UserProfile,
} from "../../../../shared/sharedTypes";
import { getSendgridApiKey } from "../config";
import { userProfileDoc } from "../users/dbPaths";
import { SpaceMeta } from "../../../../shared/spaceMeta";
import { getMetaImagePath } from "../../../../src/media/assetPaths";
const spaceInviteTemplateId = "d-9693c17248764ff5aca318e590962569";

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

interface TemplateParams {
  spaceName: string;
  senderName: string | null;
  inviteUrl: string;
  spaceImage: string;
}

const sendSpaceInvitation = functions.firestore
  .document("spaces/{spaceId}/spaceInvites/{inviteId}")
  .onCreate(async (snap, context) => {
    const data = snap.data() as SpaceInvite;

    const spaceId = context.params.spaceId as string;
    const inviteId = context.params.inviteId as string;

    const spaceInfo = await getSpaceInfo(spaceId);

    if (!spaceInfo.slug) throw new Error("missing space slug");

    const inviteUrl = createAcceptInviteUrl({
      spaceSlug: spaceInfo.slug,
      inviteId,
    });

    if (data.email) {
      const apiKey = getSendgridApiKey();
      if (!apiKey) {
        console.error("could not get sendgrid api key.");
      } else {
        sgMail.setApiKey(apiKey);

        const fromUserProfileDoc = await userProfileDoc(data.fromUserId).get();
        if (!fromUserProfileDoc.exists)
          throw new Error("could not get user profile");

        const email = data.email;

        const fromUserProfile = fromUserProfileDoc.data() as UserProfile;

        const templateParams: TemplateParams = {
          inviteUrl,
          senderName: fromUserProfile.displayName,
          spaceImage: spaceInfo.metaImage,
          spaceName: spaceInfo.spaceName,
        };

        const msg = {
          to: {
            email: email,
          },
          from: {
            name: "Arium",
            email: "info@arium.xyz",
          },
          templateId: spaceInviteTemplateId,
          dynamicTemplateData: templateParams,
        };

        console.log("sending message:");
        console.log(msg);

        await sgMail.send(msg);
      }
    }

    await snap.ref.update({
      sent: true,
      lastSentTime: firestoreTimeNow(),
      sendCount: increment(1),
      inviteUrl,
    });
  });

export default sendSpaceInvitation;
