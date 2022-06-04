interface SphericalArgs {
  config: {
    mouseDragRotationSpeed: number;
    enableDamping: boolean;
    reverseDrag: boolean;
    minPolarAngle: number;
    maxPolarAngle: number;
    dampingFactor: number;
  };

  mouseDragOn: boolean;
  delta: number;
  rotateStart: [number, number];
  rotateEnd: [number, number];
  camera: {
    quarternion: [number, number, number, number];
    position: [number, number, number];
  };
  clientWidth: number;
  clientHeight: number;
}

export const calculateNewSpherical = (args: SphericalArgs) => {
  const {
    delta,
    config: {
      enableDamping,
      mouseDragRotationSpeed,
      reverseDrag,
      dampingFactor,
      minPolarAngle,
      maxPolarAngle,
    },
    rotateStart,
    rotateEnd,
    clientHeight,
    camera,
    mouseDragOn,
  } = args;
  // @ts-ignore
  const sphericalDelta = new THREE.Spherical();
  if (mouseDragOn) {
    // get speeds
    // const actualRotationSpeed = delta * rotationSpeed;
    const actualMouseDragRotationSpeed = delta * mouseDragRotationSpeed;

    // @ts-ignore
    const rotateDelta = new THREE.Vector2([0, 0]);
    rotateDelta
      // @ts-ignore
      .subVectors(
        // @ts-ignore
        new THREE.Vector2(...rotateEnd),
        // @ts-ignore
        new THREE.Vector2(...rotateStart)
      )
      .multiplyScalar(actualMouseDragRotationSpeed);

    let angle = (2 * Math.PI * rotateDelta.x) / clientHeight;
    if (reverseDrag) {
      sphericalDelta.theta += angle;
    } else {
      sphericalDelta.theta -= angle;
    }

    angle = (2 * Math.PI * rotateDelta.y) / clientHeight;
    if (reverseDrag) {
      sphericalDelta.phi += angle;
    } else {
      sphericalDelta.phi -= angle;
    }
  }

  // const rotateStart = rotateStartRef.current;
  // const rotateEnd = rotateEndRef.current;
  // rotateStart.copy(rotateEnd);

  // @ts-ignore
  const lookDirection = new THREE.Vector3(0, 0, -1);
  // @ts-ignore
  lookDirection.applyQuaternion(new THREE.Quaternion(...camera.quarternion));
  // @ts-ignore
  const spherical = new THREE.Spherical();
  spherical.setFromVector3(lookDirection);

  // first adjust the spherical position based on the spherical deltas from this frame:
  if (enableDamping === true) {
    spherical.theta += sphericalDelta.theta * dampingFactor;
    spherical.phi += sphericalDelta.phi * dampingFactor;
  } else {
    spherical.theta += sphericalDelta.theta;
    spherical.phi += sphericalDelta.phi;
  }

  // Add in turn theta:
  // spherical.theta += turnTheta;

  // then reset the spherical deltas:
  if (enableDamping === true) {
    sphericalDelta.theta *= 1 - dampingFactor;
    sphericalDelta.phi *= 1 - dampingFactor;
  } else {
    sphericalDelta.set(0, 0, 0);
  }

  // set limits on the look angle (up and down):

  // restrict phi to be between desired limits
  spherical.phi = Math.max(
    minPolarAngle,
    Math.min(maxPolarAngle, spherical.phi)
  );

  spherical.makeSafe();

  const position = camera.position;
  // @ts-ignore
  const targetLookAt = new THREE.Vector3();
  targetLookAt
    .setFromSphericalCoords(1, spherical.phi, spherical.theta)
    // @ts-ignore
    .add(new THREE.Vector3(...position));

  return targetLookAt.toArray();
};
