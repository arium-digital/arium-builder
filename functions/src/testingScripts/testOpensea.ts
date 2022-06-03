import { fetchOpenSeaAsset } from "../nft/lib/opensea";

const main = async () => {
  // xcopy gif:
  // const tokenId = '7422';
  // const tokenAddress = '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0';
  // damon davis vid:
  const tokenId = "4451";
  const tokenAddress = "0x3b3ee1931dc30c1957379fac9aba94d1c48a5405";
  // superrare vid:
  // const tokenId = '30149';
  // const tokenAddress = '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0';
  // superrare image:
  // const tokenId = '30150';
  // const tokenAddress = '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0';
  // lapillus:
  // const tokenId = '0';
  // const tokenAddress = '0x373d1ef8e0d2a42569807c3e04894584c4ce4f8b';

  const asset = await fetchOpenSeaAsset({ tokenId, tokenAddress });

  console.log(require("util").inspect(asset, { depth: null }));
};

main();
