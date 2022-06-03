import { store } from "db";
import { useEffect, useState } from "react";
import { spaceDoc } from "shared/documentPaths";

const spaceIdWithSlugQuery = (slug: string) =>
  store.collection("spaces").where("slug", "==", slug);

const useSpaceIdForSlug = (slug: string) => {
  const [spaceId, setSpaceId] = useState<string>();
  const [doesNotExist, setDoesNotExist] = useState(false);

  useEffect(() => {
    const unsub = spaceIdWithSlugQuery(slug).onSnapshot(async (snap) => {
      if (snap.empty) {
        const spaceDocWithId = await store.collection("spaces").doc(slug).get();

        if (!spaceDocWithId.exists) {
          setDoesNotExist(true);
        } else {
          setSpaceId(slug);
        }
        return;
      }

      setSpaceId(snap.docs[0].id);
    });

    return () => unsub();
  }, [slug]);

  return { spaceId, doesNotExist };
};

export const spaceSlugForId = async (spaceId: string): Promise<string> => {
  const doc = await spaceDoc(spaceId).get();

  if (!doc.exists) return spaceId;

  const slug = doc.data()?.slug as string | undefined;

  return slug || spaceId;
};

export const spaceIdForSlug = async (spaceSlug: string) => {
  const result = await spaceIdWithSlugQuery(spaceSlug).get();

  if (result.size === 0)
    return {
      exists: false,
      id: undefined,
    };

  const firstDoc = result.docs[0];

  return {
    exists: true,
    id: firstDoc.id,
  };
};

export const useSpaceSlugsForIds = (spaceIds: string[]) => {
  const [spaceSlugs, setSpaceSlugs] = useState<
    { spaceId: string; slug: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      const spaceSlugs = await Promise.all(
        spaceIds.map(async (spaceId) => ({
          spaceId,
          slug: await spaceSlugForId(spaceId),
        }))
      );

      setSpaceSlugs(spaceSlugs);
    })();
  }, [spaceIds]);

  return spaceSlugs;
};

export const useSpaceSlugForId = (spaceId: string | undefined) => {
  const [spaceSlug, setSpaceSlug] = useState<string>();

  useEffect(() => {
    if (!spaceId) return;
    const unsub = spaceDoc(spaceId).onSnapshot((snap) => {
      if (snap.exists) {
        const slug = snap.data()?.slug as string | undefined;
        setSpaceSlug(slug);
      } else {
        setSpaceSlug(undefined);
      }
    });

    return () => unsub();
  }, [spaceId]);

  return spaceSlug;
};

export default useSpaceIdForSlug;
