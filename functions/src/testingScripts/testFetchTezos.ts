import {
  getCollectionOwned,
  fetchTokenInfo,
  fetchDomains,
  resolveDomain,
  fetchAccount,
  fetchContract,
} from "../nft/lib/tezos";

export const testFetchTezos = async (objktId: string, contract: string) => {
  const token = await fetchTokenInfo(objktId, contract);

  // token?.forEach(token => token.formats.forEach(format => console.log(format)));

  console.log(require("util").inspect(token, { depth: null }));
};

export const testFetchOwned = async (walletId: string) => {
  const owned = await getCollectionOwned(walletId);
  console.log(require("util").inspect(owned, { depth: null }));
};

export const testResolveDomain = async (domainId: string) => {
  const domain = await resolveDomain(domainId);

  console.log(require("util").inspect(domain, { depth: null }));
};
export const testFetchDomains = async () => {
  const domains = await fetchDomains();

  console.log(require("util").inspect(domains, { depth: null }));
};

export const testFetchAccount = async (address: string) => {
  const result = await fetchAccount(address);
  console.log(require("util").inspect(result, { depth: null }));
};

export const testFetchContract = async (contract: string) => {
  const result = await fetchContract(contract);
  console.log(require("util").inspect(result, { depth: null }));
};

export const johnGenerative =
  "22093723127518280930099170160039234965330541680644466749308575253240354955159";
export const gammaInteractive = "491301";
export const pupilaVideo = "205928";
export const skullAnimation = "194393";
export const fragments = "30443";
export const magicianInteractiveSvg = "8256";

export const johnGenerativeContract = "KT1TAS2v3DnjNMjaHHH2gHd9cUgQptpWE3qN";
export const hicetnunc = "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton";

export const fxHashTest = "33229";
// testFetchTezos(johnGenerative, johnGenerativeContract);
// testFetchTezos();

export const myaddress = "tz1g7hVhDD6T3s9SMqcMyiaqYjnGZ8HG4mkH";
export const someAddressThatPurchasedTeia =
  "tz1TJLzxd6oozENrAwWhDLkJzu3w79RSZy4p";
export const thorAccount = "tz1c8bog1Hw3c2AUYUcsJrKs1hw9CTfFTeCe";
testFetchOwned(myaddress);
// testFetchDomains();

export const polishCollabContract = "KT1CLJ4gRg3yp6eroLKTa1CCay82vnydEUV9";

// testFetchContract(polishCollabContract);
export const polisNftToken = {
  contract: "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton",
  tokenId: "679990",
};
// testFetchTezos(polisNftToken.tokenId, polisNftToken.contract);

// testFetchAccount('KT1CLJ4gRg3yp6eroLKTa1CCay82vnydEUV9');

// testResolveDomain('fxhashgenesis');
// testResolveDomain('hicetnunc');
