import { useRef } from "react";
import { BoxHelper, Object3D } from "three";
import { useHelper } from "@react-three/drei";

const HelperForElement = ({
  elementGroup,
  highlight,
}: {
  elementGroup: Object3D;
  highlight?: boolean | null;
}) => {
  const elementGroupRef = useRef(elementGroup);
  const color = highlight ? "cyan" : undefined;
  useHelper(elementGroupRef, BoxHelper, color);

  return null;
};

export default HelperForElement;
