import * as THREE from "three";
import { IJoystickUpdateEvent } from "../componentTypes";
import isMobile from "libs/deviceDetect";
import { Object3D } from "three";
import { computeLookAt } from "hooks/usePlayerLocations";

export interface Movement {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

const JOYSTICK_MOVEMENT_SPEED = 0.05;
const IS_MOBILE = isMobile();
export const getMovement = ({
  delta,
  movementSpeed,
  cameraMatrix,
  // collisions,
  move,
  joystickMove,
}: {
  delta: number;
  movementSpeed: number;
  cameraMatrix: THREE.Matrix4;
  // collisions?: Collisions;
  move: Movement;
  joystickMove: IJoystickUpdateEvent | undefined;
}) => {
  const actualMoveSpeed = delta * movementSpeed;
  // TODO only use XZ components of forward DIR in case we are looking up or down while travelling forward
  // NOTE: THREE.PlayerControls seems to be backwards (i.e. the 'forward' controls go backwards)...
  // Weird, but this function respects those directions for the sake of not having to make conversions
  // https://github.com/mrdoob/three.js/issues/1606
  const matrix = new THREE.Matrix4();
  matrix.extractRotation(cameraMatrix);
  const backwardDir = new THREE.Vector3(0, 0, 1).applyMatrix4(matrix);
  const forwardDir = backwardDir.clone().negate();
  const rightDir = forwardDir
    .clone()
    .cross(new THREE.Vector3(0, 1, 0))
    .normalize();
  const leftDir = rightDir.clone().negate();

  const change = new THREE.Vector3(0, 0, 0);

  let hasMovement = false;

  if (joystickMove && joystickMove.y && joystickMove.y !== 0) {
    if (joystickMove.y > 0 || joystickMove.y < 0) {
      hasMovement = true;
      change.addScaledVector(
        new THREE.Vector3(forwardDir.x, 0, forwardDir.z),
        joystickMove.y * actualMoveSpeed * JOYSTICK_MOVEMENT_SPEED
      );
    }
  }
  if (IS_MOBILE && joystickMove && joystickMove.x && joystickMove.x !== 0) {
    if (joystickMove.x > 0 || joystickMove.x < 0) {
      hasMovement = true;
      change.addScaledVector(
        new THREE.Vector3(rightDir.x, 0, rightDir.z),
        joystickMove.x * actualMoveSpeed * JOYSTICK_MOVEMENT_SPEED
      );
    }
  }

  if (move.forward) {
    hasMovement = true;
    change.addScaledVector(
      new THREE.Vector3(forwardDir.x, 0, forwardDir.z),
      actualMoveSpeed
    );
  }
  if (move.backward) {
    hasMovement = true;
    change.addScaledVector(
      new THREE.Vector3(backwardDir.x, 0, backwardDir.z),
      actualMoveSpeed
    );
  }
  if (move.left) {
    hasMovement = true;
    change.addScaledVector(
      new THREE.Vector3(leftDir.x, 0, leftDir.z),
      actualMoveSpeed
    );
  }
  if (move.right) {
    hasMovement = true;
    change.addScaledVector(
      new THREE.Vector3(rightDir.x, 0, rightDir.z),
      actualMoveSpeed
    );
  }

  return { change, hasMovement };
};

export const getLookAtFromCamera = (
  camera: THREE.Camera
): {
  quaternion: [number, number, number, number];
  lookAt: [number, number, number];
} => {
  const viewDirection = new THREE.Vector3();
  camera.getWorldDirection(viewDirection);
  // @ts-ignore
  const lookAtViewDirection = viewDirection.toArray() as [
    number,
    number,
    number,
    number
  ];

  const object3d = new Object3D();
  const cameraLocation = camera.position.toArray();
  object3d.position.set(...cameraLocation);
  const lookAt = computeLookAt(cameraLocation, lookAtViewDirection);
  object3d.lookAt(lookAt);

  return {
    quaternion: object3d.quaternion.toArray() as [
      number,
      number,
      number,
      number
    ],
    lookAt: lookAt.toArray() as [number, number, number],
  };
};

export const getTrackedTouch = (
  touches: TouchEvent["touches"],
  prevTouch: Touch
): Touch | null => {
  for (let i = 0; i < touches.length; i++)
    if (touches[i].identifier === prevTouch.identifier) return touches[i];
  return null;
};
