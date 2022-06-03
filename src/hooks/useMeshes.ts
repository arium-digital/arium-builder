import { COLLISION_DETECTION_LAYER, GROUND_DETECTION_LAYER } from "config";
import { useCallback, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
export interface CollidableMeshes {
  collidable: THREE.Mesh[];
  ground: THREE.Mesh[];
}

const useMeshes = () => {
  const { scene } = useThree();

  const [meshes, setMeshes] = useState<CollidableMeshes>({
    collidable: [],
    ground: [],
  });

  const updateMeshes = useCallback(() => {
    const allMeshes: CollidableMeshes = {
      collidable: [],
      ground: [],
    };
    const collisionLayers = new THREE.Layers();
    const groundLayers = new THREE.Layers();
    collisionLayers.set(COLLISION_DETECTION_LAYER);
    groundLayers.set(GROUND_DETECTION_LAYER);
    scene.traverse((child) => {
      if (child.type === "Mesh") {
        const mesh = child as THREE.Mesh;
        if (mesh.layers.test(collisionLayers)) {
          allMeshes.collidable.push(mesh);
        }
        if (mesh.layers.test(groundLayers)) {
          allMeshes.ground.push(mesh);
        }
      }
    });

    setMeshes(allMeshes);
  }, [scene]);

  return {
    meshes,
    updateMeshes,
  };
};

export default useMeshes;
