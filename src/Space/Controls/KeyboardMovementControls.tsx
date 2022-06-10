import { useEffect, useCallback, MutableRefObject, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, Raycaster } from "three";
import * as THREE from "three";
import { COLLISION_DETECTION_HEIGHT } from "../../config";
import { getMovement } from "./utils";
import { CollidableMeshes } from "../../hooks/useMeshes";
import { IJoystickUpdateEvent } from "../componentTypes";
import { Observable } from "rxjs";
import { defaultMove, Move } from "./useKeyboardMovementKeys";
import { useCurrentValueFromObservable } from "hooks/useObservable";

function hasCollision({
  position,
  raycaster,
  toMove,
  meshes,
}: {
  position: Vector3;
  raycaster: Raycaster;
  toMove: Vector3;
  meshes: CollidableMeshes;
}): boolean {
  raycaster.far = 0.5;
  // if (toMove.length() === 0) return false;
  const direction = toMove.clone();
  direction.normalize();

  raycaster.set(position, direction);

  const { collidable } = meshes;

  return raycaster.intersectObjects(collidable).length > 0;
}

// const getCollisions = ({
//   raycaster,
//   meshes,
//   position,
//   directions,
// }: {
//   raycaster: THREE.Raycaster;
//   meshes: CollidableMeshes;
//   position: THREE.Vector3;
//   directions: Directions;
// }) => {
//   // TODO: collect and update array of allObjects with model loading

//   raycaster.far = 0.5;

//   const { collidable } = meshes;

//   let fc = false,
//     bc = false,
//     lc = false,
//     rc = false;

//   raycaster.set(position, directions.forward);
//   try {
//     fc = raycaster.intersectObjects(collidable).length > 0;
//     raycaster.set(position, directions.backward);
//     bc = raycaster.intersectObjects(collidable).length > 0;
//     raycaster.set(position, directions.left);
//     lc = raycaster.intersectObjects(collidable).length > 0;
//     raycaster.set(position, directions.right);
//     rc = raycaster.intersectObjects(collidable).length > 0;
//   } catch (e) {
//     console.error(e);
//   }

//   return {
//     forward: fc,
//     backward: bc,
//     left: lc,
//     right: rc,
//   };
// };

const VERTICAL_DISTANCE_CHECK_OFFSET = 1;
const VERTICAL_DISTANCE_CHECK_LIMIT = 50;

const getGroundHeightAtPosition = ({
  meshes,
  position,
  raycaster,
}: {
  meshes: CollidableMeshes;
  position: THREE.Vector3;
  raycaster: THREE.Raycaster;
}) => {
  const { ground } = meshes;
  let groundHeightAtPosition = 0;

  const toCheck = new THREE.Vector3(
    position.x,
    position.y + VERTICAL_DISTANCE_CHECK_OFFSET, // set raycaster origin above avatar head
    position.z
  );

  raycaster.set(toCheck, new THREE.Vector3(0, -1, 0));
  raycaster.far = VERTICAL_DISTANCE_CHECK_LIMIT;

  try {
    const groundCollisions = raycaster.intersectObjects(ground);
    if (groundCollisions[0]) {
      groundHeightAtPosition = groundCollisions[0].point.y;
    }
  } catch (e) {
    console.error(e);
  }

  return groundHeightAtPosition;
};

const FirstPersonKeyboardMovementControls = ({
  positionRef,
  movementSpeed = 5,
  jumpSpeed = 0.5,
  gravity = 5,
  meshes,
  disableCollisions = false,
  disableGravity = false,
  joystickMoveRef,
  keyboardMovementKeys$,
  disabled,
}: {
  positionRef: MutableRefObject<Vector3 | undefined>;
  movementSpeed?: number;
  jumpSpeed?: number;
  gravity?: number;
  disableCollisions?: boolean;
  disableGravity?: boolean;
  meshes: CollidableMeshes;
  joystickMoveRef?: React.MutableRefObject<IJoystickUpdateEvent | undefined>;
  keyboardMovementKeys$: Observable<Move>;
  disabled?: boolean;
}) => {
  const onGroundRef = useRef(false);

  const jumpVelocity = useRef(0);

  const startJump = useCallback(() => {
    if (onGroundRef.current) {
      jumpVelocity.current = jumpSpeed;
    }
  }, [jumpSpeed]);

  const move = useCurrentValueFromObservable(
    keyboardMovementKeys$,
    defaultMove
  );
  const sprint = move.sprint;

  useEffect(() => {
    if (move.jump) startJump();
  }, [move.jump, startJump]);

  const { camera } = useThree();

  const raycasterRef = useRef(new Raycaster());

  useFrame((_, delta) => {
    // const directions = getDirections(camera);

    if (disabled) return;

    const position = positionRef.current;

    if (!position) return;

    const movementPoint = new THREE.Vector3(
      position.x,
      position.y + COLLISION_DETECTION_HEIGHT,
      position.z
    );

    const speedWithSprint = sprint ? movementSpeed * 2 : movementSpeed;

    const { change, hasMovement } = getMovement({
      cameraMatrix: camera.matrix,
      delta,
      move,
      movementSpeed: speedWithSprint,
      joystickMove: joystickMoveRef?.current,
    });

    const shouldMove =
      hasMovement &&
      (!!disableCollisions ||
        !hasCollision({
          position: movementPoint,
          raycaster: raycasterRef.current,
          toMove: change,
          meshes,
        }));
    // const collisions = !disableCollisions
    //   ? getCollisions({

    //     })
    //   : undefined;

    if (!disableGravity) {
      const groundHeightAtPosition = getGroundHeightAtPosition({
        meshes,
        position: movementPoint,
        raycaster: raycasterRef.current,
      });

      if (shouldMove) {
        position.add(change);
      }

      position.setY(position.y + jumpVelocity.current);

      jumpVelocity.current -= gravity * delta; // gravity
      jumpVelocity.current = Math.max(jumpVelocity.current, -10); // clamp lower bound for 'terminal velocity'

      const buffer = 0.15;
      const shoeHeight = position.y;
      const belowGround = shoeHeight <= groundHeightAtPosition + buffer;

      onGroundRef.current = belowGround;

      if (belowGround && !disableGravity) {
        jumpVelocity.current = 0;
        position.setY(groundHeightAtPosition);
      }
    }
  });

  return null;
};

export default FirstPersonKeyboardMovementControls;
