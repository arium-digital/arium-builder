import { store } from "db";
import { trackIfEnabled } from "analytics/init";
import { BigNumber } from "ethers";
import useDocument from "hooks/useDocument";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { useCallback, useEffect, useState } from "react";
import { useContract, useContractRead, useSigner } from "wagmi";
// import { Contract } from '@ethersproject/contracts'

const ABI = [
  {
    inputs: [
      {
        internalType: "uint16",
        name: "tokenId",
        type: "uint16",
      },
    ],
    name: "collect",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export type MintStatus = {
  status:
    | "not-submitted"
    | "awaiting-minting"
    | "minting"
    | "minted"
    | "failed";
  transactionHash?: string;
  token?: {
    contractAddress: string;
    tokenId: number;
  };
  error?: Error;
};

export interface VisualMassageConfig {
  showPrice: boolean;
  showMintButton: boolean;
  contractAddress: string;
  imageGateway: string;
  openSeaBaseUrl: string;
  saleContractAddress: string;
  subgraphAddress: string;
  maxVisibleDistance: number;
  maxVideoPlayDistance: number;
  videoPlayPlaneExtension: number;
}

const defaultVisualMassageConfig = (): VisualMassageConfig => ({
  showPrice: false,
  showMintButton: false,
  contractAddress: "0xb0176A12ff692085B8A481C9F2375000B851fBb9",
  saleContractAddress: "0xedf73adbf74cb2771ba7d10552355c94288cefa3",
  imageGateway: "https://visualmassage.mypinata.cloud/ipfs/",
  openSeaBaseUrl: "https://testnets.opensea.io/assets/",
  subgraphAddress:
    "https://api.thegraph.com/subgraphs/name/dievardump/visual-massage-rinkeby",
  maxVisibleDistance: 40,
  maxVideoPlayDistance: 14,
  videoPlayPlaneExtension: 8,
});

export const useVisualMassageConfig = () => {
  const document =
    process.env.NEXT_PUBLIC_VISUAL_MASSAGE_SETTINGS_DOC || "staging_contract";

  const config$ = useDocument<VisualMassageConfig>({
    path: `spaces/visual-massage/settings/${document}`,
    defaultValue: defaultVisualMassageConfig,
  });

  return useCurrentValueFromObservable(config$, undefined);
};

export const useVisualMassageContract = ({
  contractAddress: address,
}: VisualMassageConfig) => {
  const [{ data: signerData }] = useSigner();

  const contract = useContract({
    addressOrName: address,
    contractInterface: ABI,
    signerOrProvider: signerData,
  });

  const [, readPrice] = useContractRead(
    {
      addressOrName: address,
      contractInterface: ABI,
    },
    "getPrice"
  );

  const [showPrice, setShouldShowPrice] = useState(false);

  useEffect(() => {
    const unsub = store
      .collection("spaces")
      .doc("visual-massage")
      .collection("settings")
      .doc("minting")
      .onSnapshot((snapshot) => {
        if (!snapshot.exists) {
          setShouldShowPrice(false);
          return;
        }

        const config = snapshot.data() as VisualMassageConfig;

        setShouldShowPrice(!!config.showPrice);
      });

    return () => {
      unsub();
    };
  }, []);

  const readPriceCall = useCallback(
    async (tokenId: number) => {
      const result = await readPrice({
        args: tokenId,
      });

      return result.data as BigNumber | undefined;
    },
    [readPrice]
  );

  const collect = useCallback(
    async (tokenId: number) => {
      const price = await readPriceCall(tokenId);
      const result = await contract.collect(
        tokenId, // tokenId to collect; you should change this for each token
        {
          // price to pay to be able to collect
          value: price,
        }
      );

      return {
        result,
        price,
      };
    },
    [contract, readPriceCall]
  );

  return {
    collect,
    getPrice: readPriceCall,
    showPrice,
  };
};

export declare type VisualMassageContract = ReturnType<
  typeof useVisualMassageContract
>;

const useMintVisualMassageToken = ({
  collect,
  saleContractAddress: saleAddress,
}: Pick<VisualMassageContract, "collect"> &
  Pick<VisualMassageConfig, "saleContractAddress">) => {
  // const { provider, signer } = await connect();

  const [mintStatus, setMintStatus] = useState<MintStatus>({
    status: "not-submitted",
  });

  const resetStatus = useCallback(() => {
    setMintStatus({
      status: "not-submitted",
    });
  }, []);

  // const wethContractAddress = '0xA243FEB70BaCF6cD77431269e68135cf470051b4'
  // const contract = new Contract(wethContractAddress, wethInterface)
  const mint = useCallback(
    async (tokenId: number) => {
      try {
        setMintStatus({
          status: "awaiting-minting",
          // transactionHash: tx.hash || tx.transactionHash,
        });

        trackIfEnabled("Initialized mint", { tokenId });

        const { result, price } = await collect(tokenId);

        const tx = result as any;

        setMintStatus({
          status: "minting",
          transactionHash: tx.hash || tx.transactionHash,
        });

        // alert(
        //   `Follow transaction: https://rinkeby.etherscan.io/tx/${tx.hash || tx.transactionHash
        //   }`
        // );

        // then we have to "wait" for the transaction to be processed by the chain
        // that's where you usually show a loder instead of the mint button
        await tx.wait();

        trackIfEnabled("Minted successfully", { tokenId, price });

        setMintStatus((existing) => ({
          ...existing,
          status: "minted",
          token: {
            contractAddress: saleAddress,
            tokenId,
          },
        }));
      } catch (e) {
        setMintStatus({
          status: "failed",
          error: e as Error,
        });
      }
      // console.log(receipt);

      // when receipt is received, we can show a message to the user that they minted a token
      // alert(
      //   `Minted, see on OpenSea https://testnets.opensea.io/assets/${CONTRACT_ADDRESS.toLowerCase()}/${tokenId}.`
      // );
    },
    [collect, saleAddress]
  );

  return {
    mint,
    mintStatus,
    resetStatus,
  };
};

export default useMintVisualMassageToken;
