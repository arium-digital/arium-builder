import { store } from "../../../db";

export const getUserRolesRef = (userId: string) =>
  store.collection("userRoles").doc(userId);
export const getSpaceRolesRef = ({ spaceId }: { spaceId: string }) =>
  store.collection("spaceRoles").doc(spaceId);
