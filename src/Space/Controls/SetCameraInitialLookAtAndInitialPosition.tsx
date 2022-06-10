import { memo, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";

const SetCameraInitialLookAtAndInitialPosition = memo(
  ({
    position,
    initialPosition,
    initialLookAt,
    cameraOffset,
  }: {
    position: React.MutableRefObject<Vector3 | undefined>;
    initialPosition: Vector3;
    initialLookAt: Vector3;
    cameraOffset: Vector3;
  }) => {
    const { camera } = useThree();

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
      if (initialized) return;
      if (initialPosition) position.current = initialPosition;
      setTimeout(() => {
        if (position.current) camera.position.copy(position.current);
        camera.position.add(cameraOffset);
        camera.lookAt(...initialLookAt.toArray());
      }, 30);
      setInitialized(true);
    }, [
      initialLookAt,
      camera,
      initialized,
      position,
      initialPosition,
      cameraOffset,
    ]);

    return null;
  }
);

export default SetCameraInitialLookAtAndInitialPosition;
