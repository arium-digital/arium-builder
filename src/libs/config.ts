export const getFunctionsBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_FUNCTIONS_PORT)
    return `http://0.0.0.0:${process.env.NEXT_PUBLIC_FUNCTIONS_PORT}/volta-events-294715/us-central1`;
  else return "https://us-central1-volta-events-294715.cloudfunctions.net";
};
