import { useEffect, useState } from "react";
import {
  BufferGeometry,
  DoubleSide,
  Euler,
  Mesh,
  MeshBasicMaterial,
  Texture,
  Vector3,
} from "three";

const AvatarCameraSurfaces = ({
  cameraTexture,
  meshes,
}: {
  cameraTexture?: Texture | null;
  meshes: Mesh[];
}) => {
  const [localMeshes, setLocalMeshes] = useState<
    {
      geometry: BufferGeometry;
      material: MeshBasicMaterial;
      position: Vector3;
      scale: Vector3;
      rotation: Euler;
    }[]
  >();

  useEffect(() => {
    const localMeshes = meshes.map((mesh) => ({
      geometry: mesh.geometry,
      material: new MeshBasicMaterial({
        color: (mesh.material as MeshBasicMaterial).color,
      }),
      side: DoubleSide,
      position: mesh.position,
      scale: mesh.scale,
      rotation: mesh.rotation,
    }));

    setLocalMeshes(localMeshes);

    return () => {
      localMeshes.forEach((mesh) => mesh.material.dispose());
    };
  }, [meshes]);

  useEffect(() => {
    if (!localMeshes) return;
    localMeshes.forEach((mesh) => {
      mesh.material.map = cameraTexture || null;
      mesh.material.needsUpdate = true;
    });
  }, [localMeshes, cameraTexture]);

  return (
    <>
      {localMeshes?.map((mesh, i) => (
        <mesh
          key={i}
          position={mesh.position}
          scale={mesh.scale}
          rotation={mesh.rotation}
          geometry={mesh.geometry}
          material={mesh.material}
        />
      ))}
    </>
  );
};

export default AvatarCameraSurfaces;
