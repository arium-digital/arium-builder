import * as functions from "firebase-functions";
import fetch from "node-fetch";

export const fetchBlockNumber = async () => {
  const response = await fetch("https://api.blockcypher.com/v1/eth/main");

  const blockNumber = (await response.json()).height;

  return blockNumber as number;
};

export const getEthBlockNumber = functions.https.onCall(
  async (data, context) => {
    if (!context.auth?.uid) return;

    const blockNumber = await fetchBlockNumber();

    return {
      blockNumber,
    };
  }
);

export default getEthBlockNumber;
