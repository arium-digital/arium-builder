// import { Reflector as DreiReflector } from "@react-three/drei";
import { Reflector as DreiReflector } from "components/LegacyDreiReflector";
import { PointerOverContext } from "hooks/useGlobalPointerOver";
import { useGlobalPointerOverLayer } from "hooks/useLayers";
import { useCreateMeshAndSetIsGroundAndIsCollidable } from "hooks/useSetIsGroundAndIsCollidable";
import React, { FC, useContext, useEffect, useMemo } from "react";
import { useConfigOrDefaultRecursive } from "../hooks/spaceHooks";
import { Transform } from "../spaceTypes";
import {
  defaultReflectorSurfaceConfig,
  ReflectorConfig,
  ReflectorMaterialConfig,
  ReflectorSurfaceConfig,
} from "../spaceTypes/reflectorSurface";
import { ElementsContext } from "./Elements/Tree/ElementsTree";
import Frame from "./Elements/Frame";

interface IReflectorSurfaceProps {
  transform?: Transform;
  config: ReflectorSurfaceConfig;
}
const mirroredRotation: [number, number, number] = [0, -Math.PI, 0];
const rotation: [number, number, number] = [0, 0, 0];

const Reflector: FC<{
  rotation: [number, number, number];
  zOffset: number;
  reflectorConfig: ReflectorConfig;
  widthAndHeight: [number, number];
  materialConfig: Omit<ReflectorMaterialConfig, "roughnessMap">;
  isGround?: boolean;
  isCollidable?: boolean;
  meshesChanged: (() => void) | undefined;
}> = ({
  rotation,
  zOffset,
  reflectorConfig,
  widthAndHeight,
  materialConfig,
  isGround,
  isCollidable,
  meshesChanged,
}) => {
  const pointerOverContext = useContext(PointerOverContext);
  const setPointerOverMesh = useGlobalPointerOverLayer(
    pointerOverContext?.enablePointerOverLayer$
  );

  const { mesh, setMesh } = useCreateMeshAndSetIsGroundAndIsCollidable({
    meshesChanged,
    isCollidable,
    isGround,
  });
  useEffect(() => {
    if (mesh) setPointerOverMesh(mesh);
  }, [mesh, setPointerOverMesh]);

  return (
    <DreiReflector
      //@ts-ignore
      ref={setMesh}
      position={[0, 0, zOffset]}
      rotation={rotation}
      args={widthAndHeight}
      blur={reflectorConfig.resolution}
      {...reflectorConfig}
    >
      {(Material, props) => {
        // @ts-ignore
        return <Material {...materialConfig} {...props} />;
      }}
    </DreiReflector>
  );
};

const ReflectorSurface = ({
  config: {
    width,
    height,
    hasFrame,
    doubleSided,
    reflectorConfig,
    frameConfig,
    materialConfig,
    isCollidable,
    isGround,
  },
  meshesChanged,
}: IReflectorSurfaceProps & {
  meshesChanged: (() => void) | undefined;
}) => {
  const widthAndHeight: [number, number] = [width, height];
  const zOffset = useMemo(() => frameConfig.depth || 0, [frameConfig.depth]);
  const depthOverride = useMemo(
    () => (doubleSided ? (frameConfig.depth || 0) * 2 : frameConfig.depth || 0),
    [frameConfig.depth, doubleSided]
  );
  return (
    <>
      <Reflector
        {...{
          rotation,
          zOffset: zOffset + 0.001,
          reflectorConfig,
          materialConfig,
          widthAndHeight,
          meshesChanged,
          isCollidable,
          isGround,
        }}
      />
      {doubleSided && (
        <Reflector
          {...{
            zOffset: -zOffset - 0.001,
            rotation: mirroredRotation,
            reflectorConfig,
            materialConfig,
            widthAndHeight,
            meshesChanged,
            isCollidable,
            isGround,
          }}
        />
      )}
      {hasFrame && (
        <group position={[0, 0, doubleSided ? depthOverride / 2 : 0]}>
          <Frame
            config={{ ...frameConfig, depth: depthOverride }}
            imageDimensions={widthAndHeight}
          />
        </group>
      )}
    </>
  );
};

const ReflectorSurfaceWrapper = ({
  config,
  ...rest
}: IReflectorSurfaceProps) => {
  const nonNullConfig = useConfigOrDefaultRecursive(
    config,
    defaultReflectorSurfaceConfig
  );
  return (
    <ElementsContext.Consumer>
      {(elementsContext) => (
        <ReflectorSurface
          {...{ config: nonNullConfig, ...rest }}
          meshesChanged={elementsContext?.meshesChanged}
        />
      )}
    </ElementsContext.Consumer>
  );
};
export default ReflectorSurfaceWrapper;
