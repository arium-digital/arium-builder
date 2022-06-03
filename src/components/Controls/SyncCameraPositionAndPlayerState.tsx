import { RefObject } from "react";
import { Vector3 } from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { PlayerLocation } from "../../types";
import { getLookAtFromCamera } from "./utils";
import { BASE_CAMERA_HEIGHT } from "config";

const defaultCameraOffset = new Vector3(0, BASE_CAMERA_HEIGHT, 0);

const SyncCameraAndPlayerPosition = ({
  position,
  cameraOffset,
  setPositionFromCamera,
}: {
  position: RefObject<Vector3 | undefined>;
  cameraOffset?: Vector3;
  setPositionFromCamera?: boolean;
}) => {
  const { camera } = useThree();

  useFrame(() => {
    const currentPosition = position.current;
    if (!currentPosition) return;
    const offsetToUse = cameraOffset || defaultCameraOffset;
    if (setPositionFromCamera) {
      const cameraPosition = camera.position;

      currentPosition.set(
        cameraPosition.x - offsetToUse.x,
        cameraPosition.y - offsetToUse.y,
        cameraPosition.z - offsetToUse.z
      );
    } else {
      // set cameras position from current position
      camera.position.set(
        currentPosition.x,
        currentPosition.y,
        currentPosition.z
      );
      camera.position.add(offsetToUse);
    }
  });

  return null;
};

export const UpdateRemotePlayerStateFromPositionAndCameraLookAt = ({
  updatePlayerState,
  position,
}: {
  updatePlayerState: (playerState: PlayerLocation) => void;
  position: RefObject<Vector3 | undefined>;
}) => {
  const { camera } = useThree();

  useFrame(() => {
    const currentPosition = position.current;
    if (!currentPosition) return;
    // set cameras position from current position

    // const orbitControls = controls as OrbitControls | undefined;

    const cameraLookat = getLookAtFromCamera(camera);

    updatePlayerState({
      position: currentPosition.toArray(),
      quarternion: cameraLookat.quaternion,
      lookAt: cameraLookat.lookAt,
    });
  });

  return null;
};

export default SyncCameraAndPlayerPosition;
