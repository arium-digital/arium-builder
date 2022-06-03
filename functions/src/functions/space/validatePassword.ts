import * as functions from "firebase-functions";
import { store } from "../../db";
import { SpaceSecurity } from "../../../../shared/sharedTypes";
import * as brcypt from "bcryptjs";

export const validatePassword = functions.https.onCall(
  async (data, context) => {
    const { spaceId, password } = data;

    if (!spaceId || !password) throw new Error("invalid request");

    const settingsRef = store
      .collection("spaces")
      .doc(spaceId)
      .collection("settings");

    const spaceSecurityDoc = await settingsRef.doc("security").get();

    if (!spaceSecurityDoc.exists) return true;

    const spaceSecurity = spaceSecurityDoc.data() as SpaceSecurity;

    if (!spaceSecurity.requirePassword || !spaceSecurity.password) return true;

    const result = await brcypt.compare(password, spaceSecurity.password);

    return result;
  }
);
