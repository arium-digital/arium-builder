import { useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { FileLocation } from "spaceTypes";

import { Mesh, Vector3 } from "three";
// import { useEthers } from "web3/hooks";
import { Merged } from "@react-three/drei";
// import { useFrame, useThree } from "@react-three/fiber";

import { InstancedComponent } from "components/Consumers/PositionedAvatar";
import { useFileDownloadUrl } from "fileUtils";
// import { padStart } from "lodash";
import MintableVideoElement, {
  TokenElementParams,
} from "./MintableVideoElement";
import { TokenParams } from "./types";
import {
  useVisualMassageConfig,
  useVisualMassageContract,
  VisualMassageConfig,
} from "./mintVisualMassageToken";

const MintableElement = (props: TokenElementParams) => {
  return <MintableVideoElement {...props} />;
};

type VisualMassageElement = TokenParams;

type TokensSold = {
  nfts: {
    id: "string";
    tokenId: string;
  }[];
};

type HelixInfo = {
  currentHelix: {
    endId: number;
    id: number;
    price: number;
    signer: string;
    startId: number;
  };
  id: string;
  isSaleActive: boolean;
};

type TokenImageURLs = {
  [key: number]: {
    [key: string]: string;
  };
};

// image: "ipfs://QmdpUywc6Lqbqe3CNZiHr1GTRC7qPLLSCuY4weniDH1Hyq/Helix A _ 001 - 025/001 - Handmade/Handmade - A. L. Crego.gif"
// thumbnail: "ipfs://QmXB5vQMdnRnuHKvHFpNwmF3qWbaYDHDoTxcfsDNoeAei8/001_VisualMassage.jpg"
// video: "ipfs://QmdpUywc6Lqbqe3CNZiHr1GTRC7qPLLSCuY4weniDH1Hyq/Helix A _ 001 - 025/001 - Handmade/Handmade.mp4"

const getImageUrl = (
  imageData: TokenImageURLs,
  tokenId: number,
  imageType: string,
  imageGateway: string
) => {
  let urls = imageData[tokenId];
  let ipfsURL = urls[imageType] as string;
  let url = encodeURI(`${imageGateway}${ipfsURL.slice(7)}`);
  return url;
};

const fetchTokensSold = async (subgraphAddress: string) => {
  if (!subgraphAddress) return { nfts: [] };
  const result = await fetch(subgraphAddress, {
    method: "POST",
    body: JSON.stringify({ query: `{ nfts { id, tokenId }  } ` }),
  });

  return (await result.json()).data as TokensSold;
};

const fetchCurrentHelixInfo = async (subgraphAddress: string) => {
  if (!subgraphAddress) return;
  const result = await fetch(subgraphAddress, {
    method: "POST",
    body: JSON.stringify({
      query: `{
        modules(first: 5) {
          id
          isSaleActive
          currentHelix {
            id
            startId
            endId
            signer
            price
          }
        }
      }`,
    }),
  });
  const data = (await result.json()).data.modules[0] as HelixInfo;
  // console.log(data);
  return data;
};

const csvLocation: FileLocation = {
  fileLocation: "spaceAssets",
  fileType: "stored",
  fileName: "visual-massage-data.tsv",
  spaceId: "visual-massage",
};

const imageDataLocation: FileLocation = {
  fileLocation: "spaceAssets",
  fileType: "stored",
  fileName: "sorted-with-prefix-and-thumbnail.json",
  spaceId: "visual-massage",
};

const useTokenConfigs = ({ config }: { config: VisualMassageConfig }) => {
  const [configs, setConfigs] = useState<VisualMassageElement[]>();

  const csvFileUrl = useFileDownloadUrl(csvLocation);

  const imageDataFileURL = useFileDownloadUrl(imageDataLocation);

  useEffect(() => {
    if (!csvFileUrl || !imageDataFileURL) return;
    (async () => {
      const imageResponse = await fetch(imageDataFileURL);
      const imageData = (await imageResponse.json()) as TokenImageURLs;

      const response = await fetch(csvFileUrl);
      const contents = await response.text();

      const allLines = contents.split("\n");
      // skip header
      const lines = allLines.slice(1);

      const elements = lines
        .map((line) => {
          const cols = line.split("\t");
          const tokenIdString = cols[1];
          const tokenId = +tokenIdString;
          // console.log({ tokenIdString, tokenId });
          const title = cols[2];
          // const ipfsGif = /*cols[5] ||*/ getTempFile(tokenId, "gif");
          const ipfsGif = getImageUrl(
            imageData,
            tokenId,
            "image",
            config.imageGateway
          );

          // const ipfsVideo = /*cols[6] ||*/ getTempFile(tokenId, "mp4");
          const ipfsVideo = getImageUrl(
            imageData,
            tokenId,
            "video",
            config.imageGateway
          );
          // const ipfsVideo =
          //   "https://gateway.pinata.cloud/ipfs/QmdpUywc6Lqbqe3CNZiHr1GTRC7qPLLSCuY4weniDH1Hyq/Helix%20A%20_%20001%20-%20025/001%20-%20Handmade/Handmade.mp4";

          // console.log(cols.slice(8, 8 + 3), cols.slice(8, 8 + 3).map(x => +(x.replace(',', '.'))));
          const position = new Vector3(
            ...cols.slice(8, 8 + 3).map((x) => +x.replace(",", "."))
          );

          const rotation = new Vector3(
            ...cols.slice(8 + 9, 8 + 9 + 3).map((x) => +x.replace(",", "."))
          );

          rotation.x = 0;
          rotation.z = 0;

          // HACK to fix rotation
          // Rotations accumulated errors coming from Blender
          // on account of conversion from Z-Up to Y-Up
          // and Quaternion to Euler Angles
          // The following conversions solve for these errors.
          if (+cols[1] <= 100) {
            // Helix A
            if (position.z > 0) {
              rotation.y = -1 * rotation.y + Math.PI;
            }
            if (+cols[1] === 41) {
              // console.log(cols[2]);
              rotation.y -= 0.025;
            }
          } else if (+cols[1] <= 200) {
            // Helix B
            if (+cols[1] <= 117) {
              rotation.y = -rotation.y;
              rotation.y -= 1.05;
            } else if (+cols[1] <= 135) {
              rotation.y += 2.095;
            } else if (+cols[1] <= 152) {
              rotation.y = -rotation.y;
              rotation.y -= 1.05;
            } else if (+cols[1] <= 170) {
              rotation.y += 2.095;
            } else if (+cols[1] <= 188) {
              rotation.y = -rotation.y;
              rotation.y -= 1.045;
            } else {
              rotation.y += 2.092;
            }
          } else {
            // Helix C
            if (+cols[1] <= 211) {
              rotation.y += 4.188;
            } else if (+cols[1] <= 229) {
              rotation.y = -rotation.y;
              rotation.y += 1.045;
            } else if (+cols[1] <= 246) {
              rotation.y += 4.188;
            } else if (+cols[1] <= 264) {
              rotation.y = -rotation.y;
              rotation.y += 1.045;
            } else if (+cols[1] <= 282) {
              rotation.y += 4.188;
            } else if (+cols[1] <= 300) {
              rotation.y = -rotation.y;
              rotation.y += 1.045;
            }
          }

          const result: VisualMassageElement = {
            tokenId,
            title,
            gifFile: ipfsGif,
            videoFile: ipfsVideo,
            position,
            rotation,
          };

          return result;
        })
        .slice(0, 301);
      setConfigs(elements);
    })();
  }, [csvFileUrl, imageDataFileURL, config.imageGateway]);

  return configs;
};

const VisualMassageElementsInner = ({
  config,
}: {
  config: VisualMassageConfig;
}) => {
  const contract = useVisualMassageContract(config);
  const soldModel = useGLTF(
    "https://assets.vlts.pw/spaceAssets/visual-massage/door-sold-4.glb",
    true
  );

  const [soldMeshes, setSoldMeshes] = useState<Mesh[]>();

  useEffect(() => {
    if (soldModel) {
      setSoldMeshes(
        soldModel.scene.children.filter((x) => (x as Mesh).isMesh) as Mesh[]
      );
    }
  }, [soldModel]);

  const [tokensSold, setTokensSold] = useState<TokensSold | null>(null);
  const [currentHelixEndTokenId, setCurrentHelixEndTokenId] = useState<number>(
    0
  );

  useEffect(() => {
    const fetchAndUpdateTokensSold = async () => {
      setTokensSold(await fetchTokensSold(config.subgraphAddress));
    };

    fetchAndUpdateTokensSold();

    const interval = setInterval(() => {
      fetchAndUpdateTokensSold();
    }, 1000 * 10);

    return () => clearInterval(interval);
  }, [config.subgraphAddress]);

  useEffect(() => {
    const fetchAndUpdateCurrentHelixEndId = async () => {
      const helixInfo = await fetchCurrentHelixInfo(config.subgraphAddress);
      if (!helixInfo) return;
      const endId = helixInfo.currentHelix.endId;
      setCurrentHelixEndTokenId(endId);
    };

    fetchAndUpdateCurrentHelixEndId();

    const interval = setInterval(() => {
      fetchAndUpdateCurrentHelixEndId();
    }, 1000 * 10);

    return () => clearInterval(interval);
  }, [config.subgraphAddress]);

  const [tokensWithMintedStatus, setTokensWitHMintedStatus] = useState<
    TokenParams[]
  >([]);

  const configs = useTokenConfigs({ config });

  useEffect(() => {
    if (!configs) return;
    const tokensWithSoldStatus = configs.map((config) => {
      const stringId = config.tokenId.toString();
      const minted = !!tokensSold?.nfts.find((x) => x.tokenId === stringId);
      return {
        ...config,
        minted,
      };
    });

    setTokensWitHMintedStatus(tokensWithSoldStatus);
  }, [configs, tokensSold]);

  // const spaceContext = useContext(SpaceContext);
  if (!soldMeshes) return null;

  return (
    <>
      <Merged meshes={soldMeshes}>
        {(...instancedMeshes: InstancedComponent[]) =>
          tokensWithMintedStatus.map((tokenConfig) => {
            if (tokenConfig.tokenId <= currentHelixEndTokenId) {
              return (
                <MintableElement
                  key={tokenConfig.tokenId}
                  {...tokenConfig}
                  config={config}
                  soldInstancedMeshes={instancedMeshes}
                  contract={contract}
                />
              );
            }
            return null;
          })
        }
      </Merged>
    </>
  );
};

const VisualMassageElements = () => {
  const config = useVisualMassageConfig();

  return (
    <Suspense fallback={null}>
      {config && <VisualMassageElementsInner config={config} />}
    </Suspense>
  );
};

export default VisualMassageElements;
