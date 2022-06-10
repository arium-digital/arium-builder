import isMobile from "libs/deviceDetect";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { IJoystickUpdateEvent } from "../componentTypes";
import { Observable } from "rxjs";
import { Move } from "./useKeyboardMovementKeys";
import { useEffect } from "react";
import { pluck } from "rxjs/operators";

const IS_MOBILE = isMobile();
const JOYSTICK_MOVEMENT_SPEED = 30;
const KeyboardTurnControls = ({
  turnSpeed = 1000,
  movementSpeed = 0.002,
  joystickMoveRef,
  keyboardMovementKeys$,
}: {
  turnSpeed?: number;
  movementSpeed?: number;
  joystickMoveRef?: React.MutableRefObject<IJoystickUpdateEvent | undefined>;
  keyboardMovementKeys$: Observable<Move>;
}) => {
  const { camera } = useThree();
  const turnLeft = useRef(false);
  const turnRight = useRef(false);

  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  useEffect(() => {
    const leftSub = keyboardMovementKeys$.pipe(pluck("turnLeft")).subscribe({
      next: (value) => (turnLeft.current = value),
    });
    const rightSub = keyboardMovementKeys$.pipe(pluck("turnRight")).subscribe({
      next: (value) => (turnRight.current = value),
    });

    return () => {
      leftSub.unsubscribe();
      rightSub.unsubscribe();
    };
  }, [keyboardMovementKeys$]);

  useFrame((_, delta) => {
    let movementX = 0;

    if (turnLeft.current) {
      movementX = -delta * turnSpeed;
    }
    if (turnRight.current) {
      movementX = delta * turnSpeed;
    }
    if (
      !IS_MOBILE &&
      joystickMoveRef?.current &&
      joystickMoveRef.current.x !== null &&
      joystickMoveRef.current.x !== 0
    ) {
      movementX = delta * joystickMoveRef.current.x * JOYSTICK_MOVEMENT_SPEED;
    }
    if (movementX) {
      euler.current.setFromQuaternion(camera.quaternion);

      euler.current.y -= movementX * movementSpeed;

      camera.quaternion.setFromEuler(euler.current);
    }
  });

  return null;
};

export default KeyboardTurnControls;
