import * as functions from "firebase-functions";
import { FeaturedExperiencesResult } from "../../../../shared/sharedTypes";
import { SpaceMeta } from "../../../../shared/spaceMeta";
import { store } from "../../db";

const spaceDoc = (spaceId: string) => store.collection("spaces").doc(spaceId);

const spaceSettingsCollection = (spaceId: string) =>
  spaceDoc(spaceId).collection("settings");

const cacheInMinutes = 2;
const cacheInSeconds = cacheInMinutes * 60;

const featuredExperiences = functions.https.onRequest(async (req, res) => {
  const doc = await store
    .collection("homePage")
    .doc("featuredExperiences")
    .get();
  if (!doc.exists) throw new Error("missing space ids");

  const { spaces } = doc.data() as {
    spaces?: {
      spaceId: string;
      weight?: number;
    }[];
  };

  if (!spaces) throw new Error("missing space ids");

  const sortedSpaces = spaces.sort(compareSpace);

  const spaceMetasWithSpaceIds = await Promise.all(
    sortedSpaces.map(async ({ spaceId, weight }) => {
      const settingsMeta = await spaceSettingsCollection(spaceId)
        .doc("meta")
        .get();

      if (!settingsMeta.exists)
        return {
          spaceId,
          meta: null,
        };

      return {
        spaceId,
        meta: settingsMeta.data() as SpaceMeta,
      };
    })
  );

  const experiences = spaceMetasWithSpaceIds.filter((x) => x.meta !== null) as {
    spaceId: string;
    meta: SpaceMeta;
  }[];
  const result: FeaturedExperiencesResult = {
    experiences,
  };

  res.set("Cache-Control", `public, max-age=${cacheInSeconds}`);

  res.json(result);
});

export default featuredExperiences;

function compareSpace(a: { weight?: number }, b: { weight?: number }) {
  return (a.weight || 0) - (b.weight || 0);
}
