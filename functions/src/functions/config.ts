import * as functions from "firebase-functions";

export const getSendgridApiKey = (): string | undefined =>
  functions.config().sendgrid?.key;
