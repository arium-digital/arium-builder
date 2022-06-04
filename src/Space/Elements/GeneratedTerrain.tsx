import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { FileLocation, MaterialConfig } from "spaceTypes";
import { ImageLoader, Material, Mesh } from "three";
import { useFileDownloadUrl } from "fileUtils";
import { useLoader } from "@react-three/fiber";
import { Easing, TerrainConfig } from "spaceTypes/terrain";

import { GROUND_DETECTION_LAYER } from "config";
import ConfiguredMaterial from "./ConfiguredMaterial";
import { useConfigOrDefaultRecursive } from "hooks/spaceHooks";
import { defaultTerrainConfig } from "defaultConfigs";

import { Terrain, generateTerrain } from "thirdParty/THREE.Terrain";
import { useContext } from "react";
import { ElementsContext } from "./Tree/ElementsTree";

const gravelFileLocation: FileLocation = {
  fileLocation: "standardAssets",
  fileType: "stored",
  // fileName: "gravel_ground_01_diff_2k.jpg",
  // folder: "textures/gravel_ground"

  fileName: "aerial_grass_rock_diff_2k.jpg",
  folder: "textures/aerial_grass_rock_1k",
};

const sandFileLocation: FileLocation = {
  fileLocation: "standardAssets",
  fileType: "stored",
  // fileName: "gravel_ground_01_diff_2k.jpg",
  // folder: "textures/gravel_ground"

  fileName: "sand_01_diff_1k.jpg",
  folder: "textures/sand_01",
};

export const generateMaterialConfig = (): MaterialConfig => ({
  materialType: "phong",
  color: "white",
  textureFile: {
    fileLocation: "standardAssets",
    fileType: "stored",
    // fileName: "gravel_ground_01_diff_2k.jpg",
    // folder: "textures/gravel_ground"

    fileName: "aerial_grass_rock_diff_2k.jpg",
    folder: "textures/aerial_grass_rock_1k",
  },
  textureRepeatX: 16,
  textureRepeatY: 16,
  phong: {
    normalMapTextureFile: {
      fileLocation: "standardAssets",
      fileType: "stored",
      // fileName: "gravel_ground_01_nor_2k.jpg",
      // folder: "textures/gravel_ground"

      fileName: "aerial_grass_rock_nor_2k.jpg",
      folder: "textures/aerial_grass_rock_1k",
    },
    displacementMapTextureFile: {
      fileLocation: "standardAssets",
      fileType: "stored",
      // fileName: "gravel_ground_01_nor_2k.jpg",
      // folder: "textures/gravel_ground"

      fileName: "aerial_grass_rock_disp_2k.jpg",
      folder: "textures/aerial_grass_rock_1k",
    },
    bumpMapScale: 0.3,
    specularColor: "black",
  },
});

type BlendedTextureConfig = {
  baseFileUrl: string;
  otherTexture: {
    fileUrl: string;
    levels: [number, number, number, number];
  };
};

const easingFunctions = {
  Linear: Terrain.Linear,
  EaseIn: Terrain.EaseIn,
  EaseInWeak: Terrain.EaseInWeak,
  EaseOut: Terrain.EaseOut,
  EaseInOut: Terrain.EaseInOut,
  InEaseOut: Terrain.InEaseOut,
};

const getEasingFunction = (easing?: Easing) =>
  easing ? easingFunctions[easing] : undefined;

const TerrainInner = ({
  meshesChanged,
  config,
  canvas,
  material,
  handleLoaded,
}: {
  material: Material;
  config: TerrainConfig;
  meshesChanged: (() => void) | undefined;
  canvas: HTMLCanvasElement;
  handleLoaded?: (loaded: boolean) => void;
}) => {
  const [mesh, setMesh] = useState<Mesh>();

  useEffect(() => {
    if (!material) return;

    const terrain = generateTerrain({
      heightmap: canvas,
      material,
      xSegments: config.widthSegments,
      ySegments: config.heightSegments,
      easing: getEasingFunction(config.easing),
      maxHeight: config.maxHeight || 10,
      minHeight: config.minHeight || 0,
      xSize: config.width || 100,
      ySize: config.height || 100,
    });

    terrain.receiveShadow = true;

    setMesh(terrain);

    return () => {
      terrain.geometry.dispose();
    };
  }, [canvas, config, material]);

  useEffect(() => {
    if (!mesh) return;

    if (config.isGround) {
      mesh.layers.enable(GROUND_DETECTION_LAYER);
      meshesChanged && meshesChanged();

      return () => {
        mesh.layers.disableAll();
        meshesChanged && meshesChanged();
      };
    }
  }, [mesh, meshesChanged, config.isGround]);

  useLayoutEffect(() => {
    if (!handleLoaded) return;
    handleLoaded(!!mesh);
  }, [mesh, handleLoaded]);

  return (
    <group rotation-x={-Math.PI / 2}>
      {mesh && <primitive object={mesh} />}
    </group>
  );
};

const CanvasForImage = ({
  src,
  setCanvasRef,
}: {
  src: string;
  setCanvasRef: (canvas: HTMLCanvasElement | null) => void;
}) => {
  const heightMapImage = useLoader(ImageLoader, src);

  useEffect(() => {
    const canvas = document.createElement("canvas");

    canvas.width = heightMapImage.width;
    canvas.height = heightMapImage.height;

    canvas.setAttribute("style", "display:none");

    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.drawImage(heightMapImage, 0, 0, canvas.width, canvas.height);

    setCanvasRef(canvas);

    return () => {
      document.body.removeChild(canvas);
      setCanvasRef(null);
    };
  }, [heightMapImage, setCanvasRef]);

  return null;
};

const GeneratedTerrain = ({
  config,
  handleLoaded,
}: {
  config: TerrainConfig | undefined;
  handleLoaded?: (loaded: boolean) => void;
}) => {
  const values = useConfigOrDefaultRecursive(config, defaultTerrainConfig);

  const heightMapPath = useFileDownloadUrl(values.heightMapFile);
  const gravelTexturePath = useFileDownloadUrl(gravelFileLocation);
  const sandTexturePath = useFileDownloadUrl(sandFileLocation);

  const textureConfig = useMemo(() => {
    if (!gravelTexturePath || !sandTexturePath) return;

    const result: BlendedTextureConfig = {
      baseFileUrl: gravelTexturePath,
      otherTexture: {
        fileUrl: sandTexturePath,
        levels: [-10, 2, 7, 12],
      },
    };
    return result;
  }, [gravelTexturePath, sandTexturePath]);

  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  const [material, setMaterial] = useState<Material>();

  const elementsContext = useContext(ElementsContext);

  if (!heightMapPath || !textureConfig) return null;

  return (
    <>
      {canvasRef && material && (
        <TerrainInner
          meshesChanged={elementsContext?.meshesChanged}
          config={values}
          canvas={canvasRef}
          material={material}
          handleLoaded={handleLoaded}

          // useBlendedMaterial={false}
        />
      )}
      <Suspense fallback={null}>
        <CanvasForImage src={heightMapPath} setCanvasRef={setCanvasRef} />
      </Suspense>
      <Suspense fallback={null}>
        <ConfiguredMaterial
          config={values.materialConfig}
          handleMaterialSet={setMaterial}
        />
      </Suspense>
    </>
  );
};

export default GeneratedTerrain;
