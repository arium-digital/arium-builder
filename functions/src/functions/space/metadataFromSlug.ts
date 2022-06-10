import * as functions from "firebase-functions";
import { store } from "../../db";
import { SpaceMeta } from "../../../../shared/spaceMeta";
import {
  FileLocation,
  StoredFileLocation,
} from "../../../../shared/sharedTypes";
import { getAssetPath } from "../../../../src/media/assetPaths";
import { SpaceMetaResult, SpaceSecurity } from "../../../../shared/sharedTypes";
import { getSpaceDocBySlug } from "./lib/getSpace";

const getMetaImagePath = (fileLocation?: FileLocation) => {
  if (!fileLocation) return null;

  const assetPath = getAssetPath(fileLocation as StoredFileLocation);

  const bucketUrl = `https://assets.vlts.pw/${assetPath}`;

  return bucketUrl;
};

export const metadataFromSlug = functions.https.onRequest(async (req, res) => {
  const spaceSlug = req.path.slice(1);

  const spaceDoc = await getSpaceDocBySlug(spaceSlug);

  const settingsRef = spaceDoc?.ref.collection("settings");

  const spaceMetaDoc = await settingsRef?.doc("meta").get();

  const spaceSecurityDoc = await settingsRef?.doc("security").get();

  let spaceMeta: SpaceMeta;

  if (!spaceDoc || !spaceMetaDoc?.exists) {
    spaceMeta = { doesNotExist: true };

    res.json(spaceMeta);
    return;
  } else {
    spaceMeta = spaceMetaDoc?.data() as SpaceMeta;
  }

  const metaImagePath = getMetaImagePath(spaceMeta.metaImage);

  const result: SpaceMetaResult = {
    ...spaceMeta,
    metaImagePath,
    requirePassword:
      spaceSecurityDoc?.exists &&
      (spaceSecurityDoc?.data() as SpaceSecurity).requirePassword === true,
    spaceId: spaceDoc.id,
  };

  res.json(result);
});

export const getEventById = functions.https.onRequest(async (req, res) => {
  const eventSlug = req.path.slice(1);
  const events = await store
    .collection("events")
    .where("slug", "==", eventSlug)
    .get()
    .then((data) => data.docs);
  if (events.length < 1) res.status(404).json({ exist: false });
  if (events.length > 1)
    console.error(`find more than one events with slug == ${eventSlug}`);
  const eventData = await events[0].data();
  res.json(eventData);
});
