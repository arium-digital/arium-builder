import { Provider } from "wagmi";
import Space, { SpaceComponentProps } from "components/Space";
import { chain } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { providers } from "ethers";

const chains = [chain.rinkeby, chain.mainnet];

// Set up connectors
const connectors = ({ chainId }: { chainId?: number }) => {
  return [new InjectedConnector({ chains })];
};

const provider = ({ chainId }: { chainId?: number }) => {
  // @ts-ignore
  return providers.getDefaultProvider(providers.getNetwork(chainId));
};

const SpaceWithWeb3 = (props: SpaceComponentProps) => {
  return (
    <Provider connectors={connectors} provider={provider}>
      <Space {...props} />
    </Provider>
  );
};

export default SpaceWithWeb3;
