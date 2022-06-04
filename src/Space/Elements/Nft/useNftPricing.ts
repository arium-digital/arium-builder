import { useNFT } from "@zoralabs/nft-hooks";

const refreshInterval = 30 * 1000;

const useNftPricing = ({
  contractAddress,
  tokenId,
  shouldPullPricing,
}: {
  contractAddress: string | undefined;
  tokenId: string | undefined;
  shouldPullPricing: boolean;
}) => {
  const nft = useNFT(
    shouldPullPricing ? contractAddress : undefined,
    shouldPullPricing ? tokenId : undefined,
    {
      refreshInterval: shouldPullPricing ? refreshInterval : undefined,
    }
  );

  return nft?.data?.pricing;
};

export default useNftPricing;
