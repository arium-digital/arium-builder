import React, { useCallback, useContext, useMemo } from "react";
import { PlaySurfaceConfig } from "spaceTypes";
import { planeFromCrop } from "../PlaySurfaces";
import { toVector3 } from "libs/utils";
import { HoverMeshFrame } from "../HoverMesh";
import { useGlobalPointerOverLayer } from "hooks/useLayers";
import { Mesh } from "three";
import { PointerOverContext } from "hooks/useGlobalPointerOver";
import { Optional } from "types";

export const NonPlayingPlaySurface = ({
  config,
  videoWidth,
  videoHeight,
  setMesh,
  hovering,
  legacyRotation,
}: {
  config: PlaySurfaceConfig;
  videoWidth: number;
  videoHeight: number;
  setMesh?: (mesh: Optional<Mesh>) => void;
  hovering: boolean;
  legacyRotation: boolean | undefined;
}) => {
  const { cropTop = 0, cropBottom = 1, cropLeft = 0, cropRight = 1 } = config;

  const geometryShape = useMemo(
    () =>
      planeFromCrop({
        cropBottom,
        cropTop,
        cropLeft,
        cropRight,
        videoWidth,
        videoHeight,
      }),
    [cropBottom, cropTop, cropLeft, cropRight, videoWidth, videoHeight]
  );

  const pointerOverContext = useContext(PointerOverContext);
  const setMeshForDynamicLayer = useGlobalPointerOverLayer(
    pointerOverContext?.enablePointerOverLayer$
  );

  const aggregateSetMesh = useCallback(
    (mesh: Optional<Mesh>) => {
      setMeshForDynamicLayer(mesh);
      setMesh && setMesh(mesh);
    },
    [setMesh, setMeshForDynamicLayer]
  );
  const rotation = useMemo(() => (legacyRotation ? -Math.PI / 2 : 0), [
    legacyRotation,
  ]);

  return (
    <group
      position={toVector3(config.position)}
      rotation={toVector3(config.rotation)}
    >
      <group rotation-y={rotation}>
        <mesh ref={aggregateSetMesh}>
          <planeBufferGeometry args={geometryShape} />
          <meshBasicMaterial color="black"></meshBasicMaterial>
        </mesh>

        {hovering && geometryShape && (
          <HoverMeshFrame
            elementWidth={geometryShape[0]}
            elementHeight={geometryShape[1]}
          />
        )}
      </group>
    </group>
  );
};
