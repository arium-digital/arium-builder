import { Color } from "../spaceTypes";
import * as THREE from "three";

export const toThreeColor = (
  color?: Color,
  useThreeColor?: boolean
): string | undefined | THREE.Color => {
  if (!color) return undefined;
  if (useThreeColor) return new THREE.Color(color);
  return color;
};
