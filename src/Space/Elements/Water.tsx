import { getAriumCDNUrl, getFileDownloadUrl } from "fileUtils";
import { useGlobalPointerOverLayer } from "hooks/useLayers";
import { useSetIsGroundAndIsCollidable } from "hooks/useSetIsGroundAndIsCollidable";
import {
  default as React,
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useLoader } from "@react-three/fiber";
import {
  BufferGeometry,
  Material,
  Mesh,
  Object3D,
  PlaneBufferGeometry,
  TextureLoader,
} from "three";
import { GLTFLoader, Water2Options } from "three-stdlib";
// for some reason, the types def has Water2 as a named export, but its really a default export
// @ts-ignore
import { Water } from "three/examples/jsm/objects/Water2";
import {
  Concrete,
  useConfigOrDefaultRecursiveConcrete,
} from "../../hooks/spaceHooks";
import {
  defaultWaterConfig,
  DEFAULT_WATER_RESOLUTION,
  WaterConfig,
} from "../../spaceTypes/water";
import { Optional } from "types";
import { ElementsContext } from "./Tree/ElementsTree";
import { FileLocation } from "spaceTypes/shared";
import { createGltfLoader } from "./Model/useModelFile";
import { PointerOverContext } from "hooks/useGlobalPointerOver";

const getWaterNormalUrls = (resolution: number) => {
  const suffix =
    resolution === DEFAULT_WATER_RESOLUTION ? "" : `-${resolution}`;
  return [
    `standardAssets/textures/water_normal_1/Water_1_M_Normal${suffix}.jpeg`,
    `standardAssets/textures/water_normal_1/Water_2_M_Normal${suffix}.jpeg`,
  ].map(getAriumCDNUrl) as [string, string];
};

type WaterProps = {
  meshesChanged?: () => void;
  handleLoaded?: (loaded: boolean) => void;
};

async function loadGeometryFromModel(
  surfaceGeometryFile: FileLocation,
  gltfLoader: GLTFLoader
): Promise<BufferGeometry | undefined> {
  const fileUrl = await getFileDownloadUrl(surfaceGeometryFile);

  if (!fileUrl) return;

  const modelFile = await gltfLoader.loadAsync(fileUrl);

  const children = modelFile.scene.children as Mesh[];
  const firstMesh = children.find((x) => x.isMesh);

  return firstMesh?.geometry as BufferGeometry | undefined;
}

const AriumWater = ({
  handleLoaded,
  config: {
    width,
    height,
    isGround,
    color,
    reflectivity,
    flowSpeed,
    scale,
    resolution,
    surfaceGeometryFile,
    surfaceType,
  },
  meshesChanged,
}: WaterProps & {
  config: Concrete<WaterConfig>;
}) => {
  const waterNormalURLs = useMemo(() => getWaterNormalUrls(resolution), [
    resolution,
  ]);

  const [mesh, setMesh] = useState<Optional<Object3D>>();
  const [collisionMesh, setCollisionMesh] = useState<Optional<Object3D>>();
  const pointerOverContext = useContext(PointerOverContext);
  const setPointerOverMesh = useGlobalPointerOverLayer(
    pointerOverContext?.enablePointerOverLayer$
  );

  useEffect(() => {
    if (mesh) setPointerOverMesh(mesh);
  }, [mesh, setPointerOverMesh]);

  const [geometry, setGeometry] = useState<BufferGeometry>();

  const gltfLoader = useMemo(() => createGltfLoader(), []);

  useEffect(() => {
    (async () => {
      let geometry: BufferGeometry | undefined;
      if (surfaceType === "3d geometry" && surfaceGeometryFile) {
        geometry = await loadGeometryFromModel(surfaceGeometryFile, gltfLoader);
        if (geometry) {
          geometry.rotateX(Math.PI);
        }
      } else {
        geometry = new PlaneBufferGeometry(width, height);
      }
      setGeometry(geometry);
    })();
  }, [surfaceType, surfaceGeometryFile, width, height, gltfLoader]);

  useEffect(() => {
    if (geometry) return () => geometry.dispose();
  }, [geometry]);
  // const geo = useMemo(() => ;
  /**
   * r3f useLoader throw strange errors
   * everytime I call it, the scene gets unmounted.
   * I have to implement my own loader to do the same thing
   * Yang Sep 2, 2021
   */
  const waterNormalTextureA = useLoader(TextureLoader, waterNormalURLs[0]);
  const waterNormalTextureB = useLoader(TextureLoader, waterNormalURLs[1]);

  // const [waterNormalTextureA, waterNormalTextureB] = useCustomTextureLoader(
  //   waterNormalURLs
  // );

  const waterOptions = useMemo<Water2Options>(
    () => ({
      color,
      reflectivity,
      flowSpeed,
      scale,
      textureHeight: resolution,
      textureWidth: resolution,
    }),
    [color, flowSpeed, reflectivity, scale, resolution]
  );
  const [water2, setWater2] = useState<Water>();

  useEffect(() => {
    if (!waterNormalTextureA || !waterNormalTextureB || !geometry) return;
    const args: Water2Options = {
      ...waterOptions,
      normalMap0: waterNormalTextureA,
      normalMap1: waterNormalTextureB,
    };
    const water2 = new Water(geometry, args);
    setWater2(water2);

    return () => {
      (water2.material as Material).dispose();
    };
  }, [geometry, waterNormalTextureA, waterNormalTextureB, waterOptions]);

  useSetIsGroundAndIsCollidable({
    mesh: collisionMesh,
    isGround,
    meshesChanged,
  });

  useLayoutEffect(() => {
    if (!handleLoaded) return;

    if (water2) handleLoaded(true);
  }, [water2, handleLoaded]);

  if (!water2) return null;

  return (
    <group ref={setMesh} rotation-x={-Math.PI / 2}>
      <primitive object={water2} />
      {geometry && (
        <mesh geometry={geometry} ref={setCollisionMesh} visible={false} />
      )}
    </group>
  );
};

const WaterWrapper = ({
  config,
  ...rest
}: WaterProps & {
  config: WaterConfig;
}) => {
  const nonNullConfig = useConfigOrDefaultRecursiveConcrete(
    config,
    defaultWaterConfig
  );
  return (
    <Suspense fallback={null}>
      <ElementsContext.Consumer>
        {(elementsContext) => (
          <AriumWater
            {...{ config: nonNullConfig, ...rest }}
            meshesChanged={elementsContext?.meshesChanged}
          />
        )}
      </ElementsContext.Consumer>
    </Suspense>
  );
};
export default WaterWrapper;
