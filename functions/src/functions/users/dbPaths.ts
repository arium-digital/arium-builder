import { store } from "../../db";

export const userProfileDoc = (userId: string) =>
  store.collection("userProfiles").doc(userId);
