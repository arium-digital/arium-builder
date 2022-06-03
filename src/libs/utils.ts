import { IVector3 } from "../spaceTypes";
import { Camera, Vector3, Raycaster, Euler, Vector3Tuple } from "three";
import { Dispatch, SetStateAction } from "react";

export function arraysEqual<T>(
  a: T[] | undefined,
  b: T[] | undefined
): boolean {
  if (!a || !b) return false;

  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

export const toVector3 = (
  vector3: IVector3 | null | undefined,
  defaultValue = 0
): [number, number, number] | undefined => {
  if (!vector3) return;

  return [
    vector3.x || defaultValue,
    vector3.y || defaultValue,
    vector3.z || defaultValue,
  ];
};

const valueOrDefault = (
  value: number | null | undefined,
  defaultValue: number
) => {
  if (typeof value === "number") return value;
  return defaultValue;
};

export const toNonNullVector3 = (
  vector3: IVector3,
  defaultValue: IVector3
): [number, number, number] => {
  return [
    valueOrDefault(vector3.x, defaultValue.x),
    valueOrDefault(vector3.y, defaultValue.y),
    valueOrDefault(vector3.z, defaultValue.z),
  ];
};

export const tupleToIVector3 = (vector3tuple: Vector3Tuple): IVector3 => ({
  x: vector3tuple[0],
  y: vector3tuple[1],
  z: vector3tuple[2],
});
export const asIVector3 = (vector3: Vector3 | Euler): IVector3 => {
  return {
    x: vector3.x,
    y: vector3.y,
    z: vector3.z,
  };
};

export const toRadians = (degrees?: number) => {
  if (!degrees) return 0;

  return (degrees * Math.PI) / 180;
};

export const raycasterFromMouse = (camera: Camera, maxDistance: number) => {
  const worldPosition = new Vector3();
  const worldDirection = new Vector3();
  camera.getWorldPosition(worldPosition);
  camera.getWorldDirection(worldDirection);
  const raycaster = new Raycaster(worldPosition, worldDirection);
  raycaster.far = maxDistance;

  return raycaster;
};

/** assumes array elements are primitive types
 * check whether 2 arrays are equal sets.
 * @param  {} a1 is an array
 * @param  {} a2 is an array
 */
// source: https://stackoverflow.com/questions/6229197/how-to-know-if-two-arrays-have-the-same-values
export function areArraysEqualSets<T>(a1: T[], a2: T[]) {
  const superSet: { [key: string]: number } = {};
  for (const i of a1) {
    const e = i + typeof i;
    superSet[e] = 1;
  }

  for (const i of a2) {
    const e = i + typeof i;
    if (!superSet[e]) {
      return false;
    }
    superSet[e] = 2;
  }

  for (let e in superSet) {
    if (superSet[e] === 1) {
      return false;
    }
  }

  return true;
}

export function updateIfChanged<T>(
  newValue: T[],
  setState: Dispatch<SetStateAction<T[]>>
) {
  setState((existing) => {
    if (areArraysEqualSets(newValue, existing)) return existing;

    return newValue;
  });
}

export const toMediaPath = (path: string[]) => path.join("-");

type AnyDict = { [key: string]: any };

export const stripUndefined = (values: AnyDict, stripNull = false) => {
  return Object.entries(values).reduce((acc: AnyDict, [key, val]) => {
    if (typeof val === "undefined") return acc;
    if (stripNull && val === null) return acc;

    if (val !== null && typeof val === "object") {
      acc[key] = stripUndefined(val);
    } else {
      acc[key] = val;
    }

    return acc;
  }, {});
};

export const setNullIfUndefined = (values: AnyDict) => {
  return Object.entries(values).reduce((acc: AnyDict, [key, val]) => {
    if (typeof val === "undefined") {
      acc[key] = null;
    } else if (val !== null && typeof val === "object") {
      acc[key] = stripUndefined(val);
    } else {
      acc[key] = val;
    }

    return acc;
  }, {});
};

export const last = <T>(values: T[]): T | undefined => {
  if (values.length === 0) return undefined;
  return values[values.length - 1];
};

export const deepEqual = <T>(a: T, b: T) => {
  const result = JSON.stringify(a) === JSON.stringify(b);

  return result;
};

export const radiansToDegrees = (radians: number): number =>
  (radians * 180) / Math.PI;

export const degreesToRadians = (degrees: number): number =>
  (degrees * Math.PI) / 180;
