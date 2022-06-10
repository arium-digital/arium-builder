import {
  TransformControls as ThreeTransformControls,
  OrbitControls as ThreeOrbitControls,
} from "three-stdlib";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import { Vector3 } from "three";
import { useThree } from "@react-three/fiber";

const FreeFlyOrbitControls = ({
  transformControls,
  setControllingCamera,
  animateCameraPosition,
}: {
  transformControls: ThreeTransformControls | null;
  setControllingCamera: (controlling: boolean) => void;
  animateCameraPosition: (param: {
    from: Vector3;
    to: Vector3;
    lookAt: Vector3;
  }) => void;
}) => {
  const [orbitControls, setOrbitControls] = useState<ThreeOrbitControls>(null!);

  useEffect(() => {
    if (!transformControls || !orbitControls) return;
    function disableOrbitOnTransform() {
      if (!transformControls || !orbitControls) return;
      const callback = (event: any) => (orbitControls.enabled = !event.value);
      transformControls.addEventListener("dragging-changed", callback);
      return () =>
        transformControls.removeEventListener("dragging-changed", callback);
    }

    return disableOrbitOnTransform();
  }, [orbitControls, transformControls]);

  const { camera } = useThree();

  const originalPosition = useMemo(() => camera.position.clone(), [camera]);

  useEffect(() => {
    if (!orbitControls) return;

    setControllingCamera(true);

    return () => {
      const currentPosition = camera.position.clone();

      animateCameraPosition({
        from: currentPosition,
        to: originalPosition, //.clone().add(new Vector3(0, 0, 0)),
        lookAt: orbitControls.target.clone(),
      });
    };
  }, [
    setControllingCamera,
    orbitControls,
    camera,
    animateCameraPosition,
    originalPosition,
  ]);

  const [initialLookAt] = useState(() => {
    const viewDirection = new Vector3();
    camera.getWorldDirection(viewDirection);

    const cameraLocation = camera.position.clone();
    const scaled = viewDirection.normalize().multiplyScalar(25);
    return cameraLocation.add(scaled);
  });

  return (
    <OrbitControls
      makeDefault
      // @ts-ignore
      ref={setOrbitControls}
      enablePan={true}
      target={initialLookAt}
    />
  );
};

export default FreeFlyOrbitControls;
