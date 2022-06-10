import { COLLISION_DETECTION_LAYER, GROUND_DETECTION_LAYER } from "config";
import * as THREE from "three";

const BASE_CAMERA_HEIGHT = 1.75;

export interface Collisions {
  forward: boolean;
  backward: boolean;
  right: boolean;
  left: boolean;
}

/*
 * detectCollisions()
 *
 * based on method shown here:
 * https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Collision-Detection.html
 *
 * Description:
 * 1. Creates THREE.Vector3 objects representing the current forward, left, right, backward direction of the character.
 * 2. For each side of the cube,
 * 		- uses the collision detection points created in this.setupCollisionDetection()
 *		- sends a ray out from each point in the direction set up above
 * 		- if any one of the rays hits an object, set this.obstacles.SIDE (i.e. right or left) to true
 * 3. Give this.obstacles object to this.controls
 *
 * To Do: setup helper function to avoid repetitive code
 */
export function detectCollisions(
  camera: THREE.Camera,
  scene: THREE.Scene,
  raycaster: THREE.Raycaster
): Collisions {
  // reset obstacles:
  const obstacles = {
    forward: false,
    backward: false,
    right: false,
    left: false,
  };

  // TODO only use XZ components of forward DIR in case we are looking up or down while travelling forward
  // NOTE: THREE.PlayerControls seems to be backwards (i.e. the 'forward' controls go backwards)...
  // Weird, but this function respects those directions for the sake of not having to make conversions
  // https://github.com/mrdoob/three.js/issues/1606
  const matrix = new THREE.Matrix4();
  matrix.extractRotation(camera.matrix);
  const backwardDir = new THREE.Vector3(0, 0, 1).applyMatrix4(matrix);
  const forwardDir = backwardDir.clone().negate();
  const rightDir = forwardDir
    .clone()
    .cross(new THREE.Vector3(0, 1, 0))
    .normalize();
  const leftDir = rightDir.clone().negate();

  // TODO more points around avatar so we can't be inside of walls
  const COLLISION_DETECTION_HEIGHT = 0.25;
  const p1 = new THREE.Vector3(
    camera.position.x,
    camera.position.y - BASE_CAMERA_HEIGHT + COLLISION_DETECTION_HEIGHT,
    camera.position.z
  );

  const forwardCollisionDetectionPoints = [p1];
  const backwardCollisionDetectionPoints = [p1];
  const rightCollisionDetectionPoints = [p1];
  const leftCollisionDetectionPoints = [p1];

  const COLLISION_DETECTION_THRESHOLD = 1;

  // check forward
  obstacles.forward = checkCollisions(
    scene,
    raycaster,
    forwardCollisionDetectionPoints,
    forwardDir,
    COLLISION_DETECTION_THRESHOLD
  );
  obstacles.backward = checkCollisions(
    scene,
    raycaster,
    backwardCollisionDetectionPoints,
    backwardDir,
    COLLISION_DETECTION_THRESHOLD
  );
  obstacles.left = checkCollisions(
    scene,
    raycaster,
    leftCollisionDetectionPoints,
    leftDir,
    COLLISION_DETECTION_THRESHOLD
  );
  obstacles.right = checkCollisions(
    scene,
    raycaster,
    rightCollisionDetectionPoints,
    rightDir,
    COLLISION_DETECTION_THRESHOLD
  );

  return obstacles;
}

function checkCollisions(
  scene: THREE.Scene,
  raycaster: THREE.Raycaster,
  pts: THREE.Vector3[],
  dir: THREE.Vector3,
  detectCollisionDistance: number
) {
  // distance at which a collision will be detected and movement stopped (this should be greater than the movement speed per frame...)

  // TODO: collect and update array of allObjects with model loading
  const allObjects: THREE.Mesh[] = [];
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      allObjects.push(child);
    }
  });

  raycaster.layers.set(COLLISION_DETECTION_LAYER); // our collision detection layer
  raycaster.far = detectCollisionDistance;

  for (let i = 0; i < pts.length; i++) {
    const pt = pts[i];
    raycaster.set(pt, dir);
    const collisions = raycaster.intersectObjects(allObjects);
    if (collisions.length > 0) {
      return true;
    }
  }
  return false;
}

/*
 *
 *
 * getGroundHeightAtPosition
 * returns the highest position of a mesh marked 'isGround' at a given position
 *
 */
export function getGroundHeightAtPosition(
  pt: THREE.Vector3,
  scene: THREE.Scene,
  raycaster: THREE.Raycaster
) {
  const allObjects: THREE.Mesh[] = [];
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      allObjects.push(child);
    }
  });

  const VERTICAL_DISTANCE_CHECK_OFFSET = 1000;
  const toCheck = new THREE.Vector3(pt.x, VERTICAL_DISTANCE_CHECK_OFFSET, pt.z);

  raycaster.set(toCheck, new THREE.Vector3(0, -1, 0));
  raycaster.layers.set(GROUND_DETECTION_LAYER); // our collision detection layer
  const collisions = raycaster.intersectObjects(allObjects);
  if (collisions[0]) {
    return VERTICAL_DISTANCE_CHECK_OFFSET - collisions[0].distance;
  }
  return 0;
}
