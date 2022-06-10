import * as functions from "firebase-functions";
import { UserRoles } from "../../../../shared/sharedTypes";
import { store } from "../../db";
import { spaceExistsWithSlug } from "./lib/getSpace";
import { getUserRolesRef } from "./lib/paths";

async function canEditSpace({
  spaceId,
  userId,
}: {
  spaceId: string;
  userId: string;
}) {
  const spaceRolesRef = getUserRolesRef(userId);
  const spaceRolesDoc = (await spaceRolesRef.get()).data() as
    | UserRoles
    | undefined;

  if (!spaceRolesDoc) return false;

  return (
    spaceRolesDoc.editor?.includes(spaceId) ||
    spaceRolesDoc.owner?.includes(spaceId)
  );
}

const updateSlug = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) throw new Error("must be authorized");

  const { slug, spaceId } = data as {
    slug?: string;
    spaceId?: string;
  };

  if (!slug || !spaceId) throw new Error("invalid request");

  if (!(await canEditSpace({ spaceId, userId }))) {
    throw new Error("cannot edit space");
  }

  if (await spaceExistsWithSlug(slug))
    throw new Error("space exists with slug");

  const spaceDocRef = store.collection("spaces").doc(spaceId);

  await spaceDocRef.update({
    slug,
  });

  console.log("updated");
});

export default updateSlug;
