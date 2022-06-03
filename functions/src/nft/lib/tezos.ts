import fetch from "node-fetch";
import {
  OwnedTezoToken,
  TezosAccountMetadata,
  TezosTokenDetailsV2,
} from "../../../../shared/nftTypes/tezos";

export const hicetnuncContractId = "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton";

export async function fetchTokenInfo(
  id: string,
  contract: string
): Promise<TezosTokenDetailsV2[]> {
  const url = `https://api.mainnet.tzkt.io/v1/tokens?contract=${contract}&tokenId=${id.toString()}`;
  console.log("fetching ", url);
  const res = await fetch(url);
  return (await res.json()) as TezosTokenDetailsV2[];
}

export interface GetCollectionResponse {
  balances: OwnedTezoToken[];
  total: number;
}

export async function getCollectionOwned(
  walletAddress: string,
  offset = 0,
  size = 10
) {
  const res = await fetch(
    `https://api.better-call.dev/v1/account/mainnet/${walletAddress}/token_balances?size=${size}&offset=${offset}`
  );
  return (await res.json()) as GetCollectionResponse;
}

export async function fetchDomains(offset = 0, size = 10) {
  const res = await fetch(
    `https://api.better-call.dev/v1/domains/mainnet?size=${size}&offset=${offset}`
  );
  // console.log(res);
  return await res.json();
}

export async function resolveDomain(domain: string) {
  // try {
  const res = await fetch(
    `https://api.better-call.dev/v1/domains/mainnet/resolve?name=${domain}`
  );
  console.log(res);
  return await res.json();
  // } catch (error) {
  // console.error(error);
  // return null
  // }
}

export async function fetchAccount(address: string) {
  const res = await fetch(
    `https://api.tzkt.io/v1/accounts/${address}/metadata`
  );

  try {
    const result = (await res.json()) as TezosAccountMetadata;

    return {
      ...result,
      address,
    };
  } catch (e) {
    console.error("could not get metadata for account:", address);
    console.error(e);
    return {
      address,
      alias: null,
      name: null,
    };
  }
}

export async function fetchContract(address: string) {
  const res = await fetch(`https://api.tzkt.io/v1/contracts/${address}`);

  return await res.json();
}
