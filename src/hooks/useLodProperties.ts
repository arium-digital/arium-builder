import { useThree } from "@react-three/fiber";
import { deepEqual } from "libs/utils";
import { useEffect, useState } from "react";
import { Object3D, Vector3 } from "three";
import { BooleanDict } from "types";

type KeyProps = {
  [key: string]: number;
};

type KeyedPropMatches<KeyProps> = {
  [Property in keyof KeyProps]: boolean;
};

/**
 * Returns boolean properties that are true if the object is within a specified distance for each property.
 * Useful for more detailed LOD control
 *
 * @param param0
 * @returns
 */
const useLodProperties = <T extends KeyProps>({
  mesh,
  distancedProperties,
  distanceCheckInterval = 250,
  disabled = false,
}: {
  mesh: Object3D | undefined | null;
  distancedProperties: T;
  distanceCheckInterval?: number;
  disabled?: boolean;
}): KeyedPropMatches<T> | undefined => {
  const { camera } = useThree();

  const [lodProperties, setLodProperties] = useState<KeyedPropMatches<T>>();

  useEffect(() => {
    if (!mesh || disabled) return;
    const distancedPropertiesSquared = Object.entries(distancedProperties).map(
      ([key, distance]) => ({
        key,
        distanceSquared: Math.pow(distance, 2),
      })
    );

    // const cameraPosition = new Vector3();
    const objectPosition = new Vector3();
    const cameraPosition = new Vector3();

    const interval = setInterval(() => {
      objectPosition.setFromMatrixPosition(mesh.matrixWorld);
      cameraPosition.setFromMatrixPosition(camera.matrixWorld);

      const distanceSquared = objectPosition.distanceToSquared(cameraPosition);

      const enabledProperties = distancedPropertiesSquared.reduce(
        (acc: BooleanDict, current) => {
          return {
            ...acc,
            [current.key]: distanceSquared <= current.distanceSquared,
          };
        },
        {}
      ) as KeyedPropMatches<T>;

      setLodProperties((existing) => {
        if (!deepEqual(existing, enabledProperties)) return enabledProperties;

        return existing;
      });
    }, distanceCheckInterval);

    return () => {
      clearInterval(interval);
    };
  }, [disabled, distancedProperties, camera, distanceCheckInterval, mesh]);

  return lodProperties;
};

export default useLodProperties;
