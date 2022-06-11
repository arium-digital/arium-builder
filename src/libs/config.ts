import { firebaseConfig } from "config";

const firebaseFunctionsBaseUrl = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net`;

export const getFunctionsBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_FUNCTIONS_PORT)
    return `http://0.0.0.0:${process.env.NEXT_PUBLIC_FUNCTIONS_PORT}/${process.env.NEXT_PUBLIC_FUNCTIONS_EMULATOR_PATH}`;
  else return firebaseFunctionsBaseUrl;
};
