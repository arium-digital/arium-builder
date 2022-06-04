import * as THREE from "three";
import React, { memo, useMemo } from "react";
import { Object3D } from "three";
import { createPortal } from "@react-three/fiber";
import { Optional } from "types";

const visibleOpacity = 0.5;

type PlayObjectProps = {
  setPlayMesh: (playMesh: Optional<Object3D>) => void;
  elementSize: { width: number; height: number } | undefined;
};

const playPlaneExtension = 2;

const PlayObject = memo(({ setPlayMesh, elementSize }: PlayObjectProps) => {
  const planeGeometry = useMemo(() => {
    if (!elementSize) return;

    return [
      elementSize.width * playPlaneExtension,
      elementSize.height * playPlaneExtension,
    ] as [number, number];
  }, [elementSize]);

  return (
    <group ref={setPlayMesh} visible={false} rotation-z={Math.PI}>
      <mesh>
        <planeBufferGeometry args={planeGeometry} />
        <meshBasicMaterial
          transparent
          opacity={visibleOpacity}
          color="#fff"
          side={THREE.DoubleSide}
          attach="material"
        />
      </mesh>
    </group>
  );
});

const PlayObjectWrapper = ({
  playObjectContainer,
  ...rest
}: PlayObjectProps & { playObjectContainer?: Object3D }) => {
  if (playObjectContainer) {
    return <>{createPortal(<PlayObject {...rest} />, playObjectContainer)}</>;
  }
  return <PlayObject {...rest} />;
};

export default PlayObjectWrapper;
