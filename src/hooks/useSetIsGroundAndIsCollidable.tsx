import { COLLISION_DETECTION_LAYER, GROUND_DETECTION_LAYER } from "config";
import { useEffect, useState } from "react";
import { Object3D } from "three";
import { Optional, SetState } from "types";

export const useSetIsGroundAndIsCollidable = ({
  meshesChanged,
  isCollidable,
  isGround,
  mesh,
}: {
  meshesChanged: Optional<() => void>;
  isCollidable?: boolean;
  isGround?: boolean;
  mesh: Optional<Object3D>;
}) => {
  useEffect(() => {
    if (!meshesChanged || !mesh) return;

    if (!isCollidable && !isGround) return;

    if (isGround) mesh.layers.enable(GROUND_DETECTION_LAYER);
    if (isCollidable) mesh.layers.enable(COLLISION_DETECTION_LAYER);

    meshesChanged();

    return () => {
      mesh.layers.disableAll();

      meshesChanged();
    };
  }, [isGround, isCollidable, mesh, meshesChanged]);
};

export const useCreateMeshAndSetIsGroundAndIsCollidable = ({
  meshesChanged,
  isCollidable,
  isGround,
}: {
  meshesChanged: Optional<() => void>;
  isCollidable?: boolean;
  isGround?: boolean;
}): {
  mesh: Optional<Object3D>;
  setMesh: SetState<Optional<Object3D>>;
} => {
  const [mesh, setMesh] = useState<Optional<Object3D>>();

  useSetIsGroundAndIsCollidable({
    meshesChanged,
    isGround,
    isCollidable,
    mesh,
  });

  return { mesh, setMesh };
};
