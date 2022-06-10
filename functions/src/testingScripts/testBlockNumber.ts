import { fetchBlockNumber } from "../functions/nft/getEthBlockNumber";

const testBlockNumber = async () => {
  console.log(await fetchBlockNumber());
};

testBlockNumber();
