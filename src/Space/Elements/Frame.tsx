import React, { useMemo, useState } from "react";

import { FrameConfiguration } from "spaceTypes/image";
import { useConfigOrDefaultRecursive } from "hooks/spaceHooks";
import { defaultFrameConfig } from "defaultConfigs";
import ConfiguredMaterial from "./ConfiguredMaterial";

interface BoxConfig {
  center: [number, number, number];
  shape: [number, number, number];
}

const Frame = ({
  config,
  imageDimensions,
  boxFront,
  rotationY,
}: {
  config: FrameConfiguration | undefined | null;
  imageDimensions: [number, number];
  boxFront?: boolean;
  rotationY?: number;
}) => {
  const values = useConfigOrDefaultRecursive(config, defaultFrameConfig);

  const { boxes, backing, front } = useMemo(() => {
    const border = values.border as number;
    const depth = values.depth as number;
    const [imageX, imageY] = imageDimensions;

    const boxLeft: BoxConfig = {
      center: [-imageX / 2 - border / 2, 0, -depth / 2],
      shape: [border, imageY + border * 2, depth],
    };

    const boxRight: BoxConfig = {
      ...boxLeft,
      center: [-boxLeft.center[0], boxLeft.center[1], boxLeft.center[2]],
    };

    const boxTop: BoxConfig = {
      center: [0, imageY / 2 + border / 2, -depth / 2],
      shape: [imageX + border / 2, border, depth],
    };

    const boxBottom: BoxConfig = {
      ...boxTop,
      center: [boxTop.center[0], -boxTop.center[1], boxTop.center[2]],
    };

    const backingSize = {
      width: imageX + border * 2,
      height: imageY + border * 2,
    };

    const backing = {
      centerZ: -depth,
      ...backingSize,
    };

    const front = boxFront
      ? {
          centerZ: 0,
          ...backingSize,
        }
      : undefined;

    return {
      boxes: [boxLeft, boxRight, boxTop, boxBottom],
      backing,
      front,
    };
  }, [imageDimensions, values.border, values.depth, boxFront]);

  const [materialRef, setMaterialRef] = useState<THREE.Material>();

  return (
    <>
      <ConfiguredMaterial
        config={values.material}
        handleMaterialSet={setMaterialRef}
      />
      <group rotation-y={rotationY}>
        {boxes.map((boxConfig, i) => (
          <mesh
            key={i}
            position-x={boxConfig.center[0]}
            position-y={boxConfig.center[1]}
            position-z={boxConfig.center[2]}
            material={materialRef}
          >
            <boxBufferGeometry attach="geometry" args={boxConfig.shape} />
          </mesh>
        ))}
        <mesh
          position-z={backing.centerZ}
          rotation-y={Math.PI}
          material={materialRef}
        >
          <planeBufferGeometry
            attach="geometry"
            args={[backing.width, backing.height]}
          />
        </mesh>
        {front && (
          <mesh
            position-z={front.centerZ}
            // rotation-y={Math.PI}
            material={materialRef}
          >
            <planeBufferGeometry
              attach="geometry"
              args={[front.width, front.height]}
            />
          </mesh>
        )}
      </group>
    </>
  );
};

export default Frame;
