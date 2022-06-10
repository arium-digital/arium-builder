import { useFrame } from "@react-three/fiber";
import { ReactChild, useRef } from "react";
import { Object3D, Vector3 } from "three";

const WorldNeutralScaler = ({ children }: { children: ReactChild }) => {
  const outerGroupWorldScaleRef = useRef<Object3D>();
  const scaledGroupRef = useRef<Object3D>();

  const worldScaleRef = useRef(new Vector3(1, 1, 1));
  const worldNeutralScale = useRef(new Vector3(1, 1, 1));

  useFrame(() => {
    const outerGroup = outerGroupWorldScaleRef.current;
    const innerGroup = scaledGroupRef.current;
    if (!innerGroup || !outerGroup) return;

    // scale object and group to world neutral
    outerGroup.getWorldScale(worldScaleRef.current);
    worldNeutralScale.current.set(1, 1, 1);
    worldNeutralScale.current.divide(worldScaleRef.current);
    innerGroup.scale.set(
      worldNeutralScale.current.x,
      worldNeutralScale.current.y,
      worldNeutralScale.current.z
    );
  });

  return (
    <group ref={outerGroupWorldScaleRef}>
      <group ref={scaledGroupRef}>{children}</group>
    </group>
  );
};

export default WorldNeutralScaler;
