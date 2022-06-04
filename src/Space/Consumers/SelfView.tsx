import React, { memo, useContext } from "react";
import { Canvas, RootState } from "@react-three/fiber";
import { PossiblyNullStringDict } from "../../types";

// import floorTextureFile from "../../assets/images/floor-tiles.jpg";
import SelfAvatar from "Space/Consumers/SelfAvatar";
import { useContextBridge } from "@react-three/drei";
import { SpaceContext } from "hooks/useCanvasAndModalContext";

export const AudioPreview = ({ volumeLevel }: { volumeLevel: number }) => {
  return (
    <mesh position={[0, 1.5, 0.5]}>
      <sphereBufferGeometry
        attach="geometry"
        args={[volumeLevel * 0.25, 12, 12]}
      />
      <meshPhongMaterial attach="material"></meshPhongMaterial>
    </mesh>
  );
};

const onCreated = ({ gl, camera }: RootState) => {
  if (gl.setClearColor) gl.setClearColor("#ffffff", 0);
  // camera.lookAt(0, 0.75, 0);
};

const SelfView = memo(
  ({
    peerMetadata,
    preferVideoOrPhotoTexture,
  }: {
    peerMetadata: PossiblyNullStringDict | undefined;
    preferVideoOrPhotoTexture?: "photo" | "video";
  }) => {
    const ContextBridge = useContextBridge(SpaceContext);

    const { selfAvatar, avatarMeshes } = useContext(SpaceContext) || {};

    if (!selfAvatar) return null;

    return (
      <>
        <Canvas camera={{ near: 1, far: 20, fov: 45 }} onCreated={onCreated}>
          <group
            position={avatarMeshes?.selfViewPosition}
            rotation-x={avatarMeshes?.selfViewRotation?.x}
            rotation-y={avatarMeshes?.selfViewRotation?.y}
            rotation-z={avatarMeshes?.selfViewRotation?.z}
          >
            <ContextBridge>
              <SelfAvatar
                metadata={peerMetadata}
                preferVideoOrPhotoTexture={preferVideoOrPhotoTexture}
                selfAvatar={selfAvatar}
                avatarMeshes={avatarMeshes}
              />
            </ContextBridge>
          </group>
          <ambientLight></ambientLight>
        </Canvas>
      </>
    );
  }
);

export default SelfView;
