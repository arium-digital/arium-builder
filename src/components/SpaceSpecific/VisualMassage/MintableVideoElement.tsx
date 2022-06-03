import clsx from "clsx";
import { GROUP_LAYERS } from "components/Elements/Tree/Element";
import VideoPlayerWithInteractivity from "components/Elements/Video/VideoElement";
import {
  PointerOverContext,
  useDynamicGlobalPointerOverLayer,
} from "hooks/useGlobalPointerOver";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileLocation, VideoConfig } from "spaceTypes";
import { ElementType, VideoElementConfig } from "spaceTypes/Element";
import { InteractionConfig, InteractionType } from "spaceTypes/interactable";
import { BigNumber, ethers } from "ethers";

// import { useEthers } from "web3/hooks";
import useMintVisualMassageToken, {
  MintStatus /*, { Web3Context }*/,
  VisualMassageConfig,
  VisualMassageContract,
} from "components/SpaceSpecific/VisualMassage/mintVisualMassageToken";

import classes from "./styles.module.scss";
import { InstancedComponent } from "components/Consumers/PositionedAvatar";
import { TokenParams } from "./types";
import useLodProperties from "hooks/useLodProperties";
import { Object3D } from "three";
import { Optional } from "types";
import { useAccount, useConnect } from "wagmi";

const MintTokenDialog = ({
  canMint,
  mint,
  status,
}: {
  canMint: boolean;
  mint: () => void;
  status: MintStatus;
}) => {
  return (
    <>
      <p>
        <button
          onClick={mint}
          disabled={!canMint}
          className={classes.mintButton}
        >
          Mint
        </button>
      </p>
      {/* {status.status && status.status !== "not-submitted" && status.status !== "awaiting-minting" && (
        <p>Status: {status.status}</p>
      )} */}
      {(status.status === "awaiting-minting" ||
        status.status === "minting") && <p>Minting...</p>}
      {status.error && <p>Error: {status.error.message.toString()}</p>}
    </>
  );
};

const MintDialog = ({
  tokenId,
  title,
  mintToken,
  mintStatus,
  hasAccount,
  toggleConnected,
  hasBeenMinted,
  getTokenPrice,
  showPrice,
  showMintButton,
  saleContractAddress,
  openSeaBaseUrl,
}: {
  tokenId: number;
  title: string;
  mintToken: () => void;
  mintStatus: MintStatus;
  hasAccount: boolean;
  toggleConnected: () => void;
  hasBeenMinted: boolean;
  getTokenPrice: (arg0: number) => Promise<BigNumber | undefined>;
} & Pick<
  VisualMassageConfig,
  "saleContractAddress" | "openSeaBaseUrl" | "showPrice" | "showMintButton"
>) => {
  const canMint =
    hasAccount &&
    !hasBeenMinted &&
    (mintStatus.status === "not-submitted" || mintStatus.status === "failed");

  const [price, setPrice] = useState<null | string>(null);

  useEffect(() => {
    if (hasBeenMinted || !showPrice) return;
    async function updatePrice() {
      const bigNumberPrice = await getTokenPrice(tokenId);
      if (bigNumberPrice) {
        const readablePrice = ethers.utils.formatEther(bigNumberPrice);
        setPrice(readablePrice);
      }
    }
    updatePrice();
  }, [getTokenPrice, hasBeenMinted, tokenId, showPrice]);

  // console.log({
  //   canMint,
  //   status: status.status
  // })
  // console.log({
  //   librarrrry: library
  // });
  return (
    <div className={classes.contents}>
      <div className={classes.top}>
        <h2>
          #{tokenId}: {title}
        </h2>
        {showMintButton && (
          <>
            <div className={classes.connecToMetamaskButton}>
              <p>
                metamask{" "}
                <button
                  // @ts-ignore
                  onClick={toggleConnected}
                  className={clsx(classes.connectButton, {
                    [classes.connected]: hasAccount,
                  })}
                ></button>
              </p>
            </div>
            {/* {account && (
          <>
            <p>
              Connected to Metamask. {account}:{" "}
              <button onClick={deactivate}> Disconnect</button>
            </p>
          </>
        )} */}

            <MintTokenDialog
              canMint={canMint}
              mint={mintToken}
              status={mintStatus}
            />
          </>
        )}

        {!hasBeenMinted && price && showPrice && <h4>PRICE: {price} ETH</h4>}
        {hasBeenMinted && saleContractAddress && (
          <p>
            Minted{" "}
            <a
              href={`${openSeaBaseUrl}${saleContractAddress.toLowerCase()}/${tokenId}`}
              target="_blank"
              rel="noreferrer"
            >
              View on OpenSea
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export type TokenElementParams = TokenParams & {
  // unsoldMesh: Group;
  soldInstancedMeshes: InstancedComponent[];
  contract: VisualMassageContract;
  config: VisualMassageConfig;
};

const MintableVideoElement = ({
  tokenId,
  videoFile,
  gifFile,
  title,
  position,
  rotation,
  soldInstancedMeshes,
  minted,
  contract,
  config,
}: TokenElementParams) => {
  const [{ data /*, error, loading*/ }, connect] = useConnect();
  const [, disconnect] = useAccount();

  const { mint, mintStatus, resetStatus } = useMintVisualMassageToken({
    collect: contract.collect,
    saleContractAddress: config.saleContractAddress,
  });

  const mintToken = useCallback(() => {
    mint(tokenId);
  }, [tokenId, mint]);

  const hasAccount = data.connected;

  const toggleConnected = useCallback(() => {
    // console.log({
    //   spaceContext,
    //   activateBrowserWallet
    // });
    if (hasAccount) {
      disconnect();
      resetStatus();
    } else {
      connect(data.connectors[0]);
    }
  }, [connect, data.connectors, disconnect, hasAccount, resetStatus]);

  const hasBeenMinted = minted || mintStatus.status === "minted";

  const [videoGroupRef, setVideoGroupRef] = useState<Optional<Object3D>>();
  const distancePropertiesMemoized = useMemo(
    () => ({
      visible: config.maxVisibleDistance,
    }),
    [config.maxVisibleDistance]
  );

  const lodProperties = useLodProperties({
    mesh: videoGroupRef,
    distancedProperties: distancePropertiesMemoized,
    distanceCheckInterval: 2000,
  });

  const visible = !!lodProperties?.visible;

  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (visible) setHasBeenVisible(true);
  }, [visible]);

  const Contents = useMemo(
    () =>
      hasBeenVisible ? (
        <MintDialog
          tokenId={tokenId}
          title={title}
          mintToken={mintToken}
          mintStatus={mintStatus}
          toggleConnected={toggleConnected}
          hasAccount={hasAccount}
          hasBeenMinted={hasBeenMinted}
          getTokenPrice={contract.getPrice}
          showPrice={config.showPrice}
          showMintButton={config.showMintButton}
          saleContractAddress={config.saleContractAddress}
          openSeaBaseUrl={config.openSeaBaseUrl}
        />
      ) : (
        <></>
      ),
    [
      hasBeenVisible,
      tokenId,
      title,
      mintToken,
      mintStatus,
      toggleConnected,
      hasAccount,
      hasBeenMinted,
      contract.getPrice,
      config.showPrice,
      config.saleContractAddress,
      config.openSeaBaseUrl,
      config.showMintButton,
    ]
  );

  const interactableDetailsFile: FileLocation = useMemo(
    () => ({
      fileType: "external",
      url: gifFile,
    }),
    [gifFile]
  );

  const interactableConfig: InteractionConfig = useMemo(() => {
    return {
      action: InteractionType.showModal,
      payload: {
        detailFile: interactableDetailsFile,
        detailFileType: "image",
        showDetail: true,
        contentHTML: Contents,
        backgroundColor: "#101010",
        maxDistance: 10,
        contentVerticalAlignment: "top",
      },
    };
  }, [Contents, interactableDetailsFile]);

  const inSpaceFile: FileLocation = useMemo(
    () => ({
      fileType: "external",
      url: videoFile,
    }),
    [videoFile]
  );

  const elementConfig: VideoElementConfig = useMemo(() => {
    const videoConfig: VideoConfig = {
      type: "stored video",
      storedVideo: inSpaceFile,
      interactable: true,
      settings: {
        playSettings: {
          auto: false,
          maxDistance: config.maxVideoPlayDistance,
          playPlaneExtension: config.videoPlayPlaneExtension,
        },
        geometry: {
          mediaGeometryType: "plane",
        },
      },
      interactableConfig: interactableConfig,
      frame: {
        hasFrame: false,
      },
    };
    return {
      elementType: ElementType.video,
      active: true,
      video: videoConfig,
    };
  }, [
    inSpaceFile,
    interactableConfig,
    config.maxVideoPlayDistance,
    config.videoPlayPlaneExtension,
  ]);

  const pointerOverDisabled = !lodProperties?.visible;
  const pointerOverContext = useDynamicGlobalPointerOverLayer(
    null,
    elementConfig,
    pointerOverDisabled
  );

  const elementId = tokenId.toString();

  return (
    <>
      <group
        position={position}
        rotation-x={rotation.x}
        rotation-y={rotation.y}
        rotation-z={rotation.z}
        name={elementId}
        // @ts-ignore
        layers={GROUP_LAYERS}
        ref={pointerOverContext.setElementGroup}
      >
        <PointerOverContext.Provider value={pointerOverContext}>
          <group ref={setVideoGroupRef} visible={visible}>
            <VideoPlayerWithInteractivity
              config={elementConfig.video}
              elementId={elementId}
              visible={visible}
              elementTransform={undefined}
            />
          </group>
        </PointerOverContext.Provider>

        {hasBeenMinted && (
          <>
            <group>
              {soldInstancedMeshes.map((InstancedMesh, i) => (
                <InstancedMesh key={i} />
              ))}
            </group>
            {/* <mesh position-y={3}>
              <sphereBufferGeometry args={[0.5, 32, 32]} />
              <meshBasicMaterial color="white" />
            </mesh> */}
          </>
        )}
      </group>
      {/* <primitive object={unsoldMesh} /> */}
    </>
  );
};

export default MintableVideoElement;
