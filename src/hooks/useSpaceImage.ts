import { store } from "db";
import { SpaceMeta } from "spaceTypes";
import { getFileDownloadUrl } from "fileUtils";
import { useState, useEffect } from "react";

const getSpaceImage = async (spaceId: string) => {
  const spaceMetaDoc = await store
    .collection("spaces")
    .doc(spaceId)
    .collection("settings")
    .doc("meta")
    .get();

  if (!spaceMetaDoc.exists) {
    return null;
  }

  const spaceMeta = spaceMetaDoc.data() as SpaceMeta;

  if (!spaceMeta.metaImage) {
    return null;
  }

  return getFileDownloadUrl(spaceMeta.metaImage);
};

const useSpaceImage = (spaceId: string) => {
  const [spaceImage, setSpaceImage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const spaceImage = await getSpaceImage(spaceId);

      if (spaceImage) setSpaceImage(spaceImage);
    })();
  }, [spaceId]);

  return spaceImage;
};

export default useSpaceImage;
