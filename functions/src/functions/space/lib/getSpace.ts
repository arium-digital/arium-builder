import randomString from "random-string";
import { store } from "../../../db";

export async function getSpaceDocBySlug(slug: string) {
  const result = await store
    .collection("spaces")
    .where("slug", "==", slug)
    .get();

  if (result.size === 0) return null;

  return result.docs[0];
}

export async function spaceExistsWithSlug(slug: string) {
  return !!(await getSpaceDocBySlug(slug));
}

export function spaceDoc(spaceId: string) {
  return store.collection("spaces").doc(spaceId);
}

async function spaceExistsWithId(id: string) {
  return (await spaceDoc(id).get()).exists;
}

const maxTries = 7;
export async function generateNewSpaceId(length: number) {
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const newId = randomString({
      length: length + attempt,
    }).toLowerCase();

    if (!(await spaceExistsWithId(newId))) return newId;
  }

  throw new Error("could not create unique id for space");
}

export async function getOrGenerateSlug({
  newSpaceId,
  desiredSlug,
}: {
  newSpaceId: string;
  desiredSlug: string | undefined;
}): Promise<string> {
  if (desiredSlug) {
    if (await spaceExistsWithSlug(desiredSlug)) {
      throw new Error("space already exists with slug");
    }
    return desiredSlug;
  }

  if (!(await spaceExistsWithSlug(newSpaceId))) return newSpaceId;

  for (let attempt = 0; attempt < maxTries; attempt++) {
    const newSlug = randomString({
      length: 5 + attempt,
    }).toLowerCase();

    if (!(await spaceExistsWithSlug(newSlug))) return newSlug;
  }

  throw new Error("could not create unique slug for space");
}
