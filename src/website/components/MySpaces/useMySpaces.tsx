import { getMetaImagePath } from "fileUtils";
import { useEffect, useState } from "react";
import { spaceDoc, spaceSettingsCollection } from "shared/documentPaths";
import { SpaceMeta } from "spaceTypes";
import { SpaceSecurity } from "../../../../shared/sharedTypes";
import { CombinedSpaceInfo } from "./types";

const getSpaceMeta = async (
  spaceId: string
): Promise<SpaceMeta & { metaImageUrl?: string }> => {
  return spaceSettingsCollection(spaceId)
    .doc("meta")
    .get()
    .then((doc) => doc.data() as SpaceMeta)
    .then(async (data) => {
      return {
        ...data,
        metaImageUrl: await getMetaImagePath(data?.metaImage),
      };
    })
    .catch((err) => {
      console.error(err);
      throw Error(err);
    });
};

const getSpaceSecurity = async (spaceId: string): Promise<SpaceSecurity> => {
  return spaceSettingsCollection(spaceId)
    .doc("security")
    .get()
    .then((doc) => doc.data() as SpaceSecurity)
    .catch((err) => {
      console.error(err);
      throw Error(err);
    });
};

export const useCombinedSpaceInfo = (
  spaceId: string
): CombinedSpaceInfo | null => {
  const [space, setSpace] = useState<Omit<CombinedSpaceInfo, "slug"> | null>(
    null
  );

  const [slug, setSlug] = useState<string>(spaceId);

  useEffect(() => {
    if (!spaceId) return;
    const unsub = spaceDoc(spaceId).onSnapshot((snap) => {
      if (snap.exists) {
        const slug = snap.data()?.slug as string | undefined;
        if (slug) setSlug(slug);
      }
    });

    return () => unsub();
  }, [spaceId]);

  useEffect(() => {
    const abort = new AbortController();
    (async () => ({
      id: spaceId,
      ...(await getSpaceMeta(spaceId)),
      ...(await getSpaceSecurity(spaceId)),
    }))()
      .then((data) => {
        setSpace(data);
      })
      .catch((err) => {
        console.error(err);
        setSpace(null);
      });
    return () => {
      abort.abort();
      setSpace(null);
    };
  }, [spaceId]);
  if (!space) return null;

  return {
    ...space,
    slug,
  };
};
