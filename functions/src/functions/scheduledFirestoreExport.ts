import * as functions from "firebase-functions";
import { logError } from "./errorHandling";
const firestore = require("@google-cloud/firestore");

const bucket = "gs://arium-backups";

const scheduledFirestoreExport = functions.pubsub
  .schedule("every 4 hours")
  .onRun((context) => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;

    console.log("scheduling firestore export");

    const client = new firestore.v1.FirestoreAdminClient();
    const databaseName = client.databasePath(projectId, "(default)");

    return client
      .exportDocuments({
        name: databaseName,
        outputUriPrefix: bucket,
        // Leave collectionIds empty to export all collections
        // or set to a list of collection IDs to export,
        // collectionIds: ['users', 'posts']
        collectionIds: [
          "defaultSettings",
          "devEnvironments",
          "globalSettings",
          "settings",
          "spaceMembers",
          "elements",
          "elementsTree",
          "userRoles",
          "spaces",
          "users",
          "eventRegistrations",
          "betaSignUps",
          "events",
          // "userAccounts",
          // "userProfiles",
        ],
      })
      .then((responses: any[]) => {
        const response = responses[0];
        console.log(`Operation Name: ${response["name"]}`);
      })
      .catch((err: Error) => {
        logError(err);
        throw new Error("Export operation failed");
      });
  });

export default scheduledFirestoreExport;
