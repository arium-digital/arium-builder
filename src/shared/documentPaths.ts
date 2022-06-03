import { store } from "../db";
import firestore from "@google-cloud/firestore";

export const spaceDoc = (spaceId: string) =>
  store.collection("spaces").doc(spaceId);

export const spaceSettingsCollection = (spaceId: string) =>
  spaceDoc(spaceId).collection("settings");

export const environmentDocument = (spaceId: string) =>
  spaceSettingsCollection(spaceId).doc("environment");

export const spaceMetaDocument = (spaceId: string) =>
  spaceSettingsCollection(spaceId).doc("meta");

export const userProfilesCollection = () => store.collection("userProfiles");

export const userProfilesDoc = (userId: string) =>
  userProfilesCollection().doc(userId);

export const spaceSecurityDocument = (spaceId: string) => {
  return spaceSettingsCollection(spaceId).doc("security");
};

export const spacePositionalAudioConfigDocument = (spaceId: string) => {
  return spaceSettingsCollection(spaceId).doc("defaultPositionalAudioConfig");
};

export const spacePositionalPhysicsDocument = (spaceId: string) => {
  return spaceSettingsCollection(spaceId).doc("physics");
};
export const spaceExperimentalCameraDocument = (spaceId: string) => {
  return spaceSettingsCollection(spaceId).doc("camera");
};

export const spaceEffectsDoc = (spaceId: string) =>
  spaceSettingsCollection(spaceId).doc("effects");
export const themeDocument = (spaceId: string) => {
  return spaceSettingsCollection(spaceId).doc("theme");
};

type DefaultSettingsDocumentsKey = "meta";

export const defaultSettingsDocument = (key: DefaultSettingsDocumentsKey) => {
  return store.collection("defaultSettings").doc(key);
};

export const betaSignUpsCollection = () => {
  return store.collection("betaSignUps");
};

export const eventRegistrationsCollection = () => {
  return store.collection("eventRegistrations");
};

export const spaceInvitesCollection = (spaceId: string) =>
  store.collection("spaces").doc(spaceId).collection("spaceInvites");

export const spaceInvite = ({
  spaceId,
  inviteId,
}: {
  spaceId: string;
  inviteId: string;
}) => spaceInvitesCollection(spaceId).doc(inviteId);

export const getElementsCollectionRef = (
  spaceId?: string
): firestore.CollectionReference | undefined => {
  if (!spaceId) return undefined;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return store.collection("spaces").doc(spaceId).collection("elementsTree");
};
