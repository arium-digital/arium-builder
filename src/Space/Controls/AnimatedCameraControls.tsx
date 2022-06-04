import { TransformControls, OrbitControls } from "three-stdlib";
import {
  TransformControls as DreiTransformControls,
  OrbitControls as DreiOrbitControls,
} from "@react-three/drei";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  MutableRefObject,
  useLayoutEffect,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BufferGeometry, Object3D } from "three";
import { animated, useSpring } from "@react-spring/three";
import range from "lodash/range";

const ARC_SEGMENTS = 200;

const CameraTrackCurve = ({
  trackPoints,
  isAnimating,
  transformControls,
  cameraTarget,
  loopTime,
  startingPoints,
}: {
  isAnimating: boolean;
  trackPoints: MutableRefObject<Object3D[]>;
  startingPoints: [number, number, number][];
  transformControls: TransformControls | null;
  cameraTarget: React.RefObject<Object3D | undefined>;
  loopTime: number;
}) => {
  const [curve, setCurve] = useState<THREE.CatmullRomCurve3>();
  const [
    bufferGeometryRef,
    setBufferGeometry,
  ] = useState<BufferGeometry | null>(null);

  const updateCurve = useCallback(() => {
    if (!curve || !bufferGeometryRef) return;
    const objects = trackPoints.current.slice(0, startingPoints.length);
    curve.points = objects.map((x) => x.position);

    curve.updateArcLengths();

    bufferGeometryRef.setFromPoints(curve.getPoints(ARC_SEGMENTS * 3));
    bufferGeometryRef.attributes.position.needsUpdate = true;
  }, [curve, bufferGeometryRef, trackPoints, startingPoints.length]);

  useEffect(() => {
    if (!curve) {
      const objects = trackPoints.current.slice(0, startingPoints.length);
      if (objects.length >= 2) {
        const newCurve = new THREE.CatmullRomCurve3(
          objects.map((x) => x.position)
        );
        // @ts-ignore
        newCurve.curveType = "catmullrom";
        setCurve(newCurve);
      }

      return;
    }

    updateCurve();
  }, [curve, startingPoints, trackPoints, updateCurve]);

  useEffect(() => {
    if (!transformControls) return;

    transformControls.addEventListener("objectChange", updateCurve);

    return () => {
      transformControls.removeEventListener("objectChange", updateCurve);
    };
  }, [trackPoints, transformControls, updateCurve]);

  return (
    <>
      <line
        // @ts-ignore
        visible={!isAnimating}
      >
        <bufferGeometry ref={setBufferGeometry} />
        <lineBasicMaterial color={0xffffff} opacity={0.85} />
      </line>
      {curve && cameraTarget.current && (
        <CameraAnimation
          curve={curve}
          target={cameraTarget.current}
          loopTime={loopTime}
          isAnimating={isAnimating}
        />
      )}
    </>
  );
};

const CameraAnimation = ({
  curve,
  target,
  loopTime,
  isAnimating,
}: {
  curve: THREE.CatmullRomCurve3;
  target: Object3D;
  loopTime: number;
  isAnimating: boolean;
}) => {
  const { camera } = useThree();
  const meshRef = useRef<Object3D>();
  const position = useRef(new THREE.Vector3());
  const trackPosition = useRef(0);
  useFrame(() => {
    // const time = Date.now();
    trackPosition.current = trackPosition.current + loopTime;
    if (trackPosition.current >= 1) {
      trackPosition.current = 0;
    }
    // const t = (time % loopTime) / loopTime;

    curve.getPointAt(trackPosition.current, position.current);
    position.current.multiplyScalar(1);

    meshRef.current?.position.copy(position.current);
    meshRef.current?.lookAt(target.position);
    if (isAnimating) {
      camera.position.copy(position.current);
      camera.lookAt(target.position);
    }
  });
  return (
    <mesh visible={!isAnimating} ref={meshRef}>
      <sphereBufferGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color={0xffff00} />
    </mesh>
  );
};

const CAMERA_TRANSFORM_TARGET = -1;

const CameraTrackPoint = ({
  trackPoints,
  index,
  setTransformTarget,
  transformTarget,
  attachControlsTo,
  visible,
  startingPosition,
}: {
  trackPoints: MutableRefObject<Object3D[]>;
  index: number;
  transformTarget: number | null;
  attachControlsTo: (object3d: Object3D) => void;
  setTransformTarget: (index: number | null) => void;
  visible: boolean;
  startingPosition: [number, number, number];
}) => {
  const meshRef = useRef<Object3D>();

  const selected = transformTarget === index;

  const [hovered, setHovered] = useState(false);

  const { scale } = useSpring({ scale: hovered && !selected ? 1.2 : 1 });

  useEffect(() => {
    if (!meshRef.current) return;
    if (transformTarget === index) {
      // transformControls.detach();
      attachControlsTo(meshRef.current);
    }
  }, [transformTarget, attachControlsTo, index]);

  const pointClicked = useCallback(() => {
    setTransformTarget(index);
  }, [setTransformTarget, index]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.position.set(...startingPosition);

    trackPoints.current[index] = meshRef.current;
  }, [meshRef, index, trackPoints, startingPosition]);

  return (
    <animated.mesh
      onClick={pointClicked}
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={scale}
      visible={visible}
    >
      <boxBufferGeometry />
      <meshBasicMaterial color={selected ? 0xffff00 : 0xffffff} />
    </animated.mesh>
  );
};

const addRandomSplinePosition = (): [number, number, number] => {
  return [
    Math.random() * 50 - 25,
    20 + Math.random() * 20,
    Math.random() * 50 - 25,
  ];
};

const AnimatedCameraControls = () => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const cameraTarget = useRef<Object3D>();
  const [looptime, setLoopTime] = useState(0.001);

  const trackObjects = useRef<THREE.Object3D[]>([]);
  const [startingPoints, setStartingPoints] = useState<
    [number, number, number][]
  >(() => range(3).map(() => addRandomSplinePosition()));

  const addPoint = useCallback(() => {
    setStartingPoints((existing) => {
      const trackObjectsCurrent = trackObjects.current.slice(
        0,
        existing.length
      );
      const [secondToLast, lastPoint] = trackObjectsCurrent
        .slice(trackObjectsCurrent.length - 2, trackObjectsCurrent.length)
        .map((x) => x.position);

      const direction = lastPoint.clone().sub(secondToLast).normalize();

      const newPoint = lastPoint.clone().add(direction.multiplyScalar(5));

      const result = [...existing, [newPoint.x, newPoint.y, newPoint.z]] as [
        number,
        number,
        number
      ][];

      setTransformTarget(result.length - 1);

      return result;
    });
  }, []);

  const [transformTarget, setTransformTarget] = useState<number | null>(null);

  const removePoint = useCallback(() => {
    setStartingPoints((existing) => {
      if (existing.length <= 2) return existing;

      const result = existing.slice(0, existing.length - 1);

      setTransformTarget((existingTarget) => {
        if (!existingTarget) return null;
        if (existingTarget > result.length - 1) {
          return result.length - 1;
        }

        return existingTarget;
      });

      return result;
    });
  }, []);

  const exportSpline = useCallback(() => {
    if (!cameraTarget.current) return;

    const cameraTargetPoint = cameraTarget.current.position;

    const trackObjectPoints = trackObjects.current
      .slice(0, startingPoints.length)
      .map(({ position }) => position);

    const stringOfPoints = [cameraTargetPoint, ...trackObjectPoints]
      .map((p) => [p.x.toString(), p.y.toString(), p.z.toString()].join(","))
      .join("\n");

    prompt("Copy control points:", stringOfPoints);
  }, [startingPoints]);

  const loadSpline = useCallback(() => {
    if (!cameraTarget.current) return;

    const stringOfPoints = prompt("Paste control points:", "");

    if (!stringOfPoints) return;

    const pointsArray = stringOfPoints
      .split("\n")
      .map(
        (coords) => coords.split(",").map((x) => +x) as [number, number, number]
      );

    const [cameraTargetPoint, ...trackObjectPointPositions] = pointsArray;

    cameraTarget.current.position.set(...cameraTargetPoint);

    setStartingPoints(trackObjectPointPositions);
  }, []);

  const [orbitControls, setOrbitControls] = useState<OrbitControls>(null!);
  const [transformControls, setTransformControls] = useState<TransformControls>(
    null!
  );

  const numPoints = startingPoints.length;

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      switch (event.keyCode) {
        case 69: // E
          transformControls?.setSpace("local");
          transformControls?.setMode("rotate");
          break;
        default:
          return;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.keyCode) {
        case 69: // E
          transformControls?.setSpace("world");
          transformControls?.setMode("translate");
          break;

        case 187: // +
          addPoint();
          break;

        case 189: // -
          removePoint();
          break;

        case 221: // ]
          setLoopTime((existing) => existing + 0.0001);
          break;

        case 219: // [
          setLoopTime((existing) => existing - 0.0001);
          break;

        case 32: // space
          setIsAnimating((existing) => !existing);
          break;

        case 75: // 'K'
          exportSpline();
          break;

        case 76: // 'L'
          loadSpline();
          break;

        case 188: // '<'
          setTransformTarget((existing) => {
            if (existing === null) return CAMERA_TRANSFORM_TARGET;

            if (existing === 0) return CAMERA_TRANSFORM_TARGET;

            if (existing === CAMERA_TRANSFORM_TARGET) return numPoints - 1;

            return existing - 1;
          });
          break;

        case 190: // '>'
          setTransformTarget((existing) => {
            if (existing === null) return CAMERA_TRANSFORM_TARGET;

            if (existing + 1 >= numPoints) {
              return CAMERA_TRANSFORM_TARGET;
            }
            return existing + 1;
          });
          break;

        default:
          return;
      }
    };

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    addPoint,
    removePoint,
    exportSpline,
    loadSpline,
    transformControls,
    numPoints,
  ]);

  const orbitTargetRef = useRef(new THREE.Vector3());

  const [orbitTargetPosition, setOrbitTargetPosition] = useState([0, 0, 0]);

  useSpring({
    to: {
      x: orbitTargetPosition[0],
      y: orbitTargetPosition[1],
      z: orbitTargetPosition[2],
    },
    onChange: (change) => {
      orbitTargetRef.current.set(
        change.value.x,
        change.value.y,
        change.value.z
      );
    },
  });

  const attachControlsTo = useCallback(
    (object3d: Object3D) => {
      if (!orbitControls || !transformControls) return;
      transformControls.detach();
      transformControls.attach(object3d);

      setOrbitTargetPosition(object3d.position.toArray());
    },
    [orbitControls, transformControls]
  );

  useEffect(() => {
    if (!cameraTarget.current) return;
    if (transformTarget && transformTarget === CAMERA_TRANSFORM_TARGET) {
      attachControlsTo(cameraTarget.current);
    }
  }, [attachControlsTo, transformTarget]);

  const clearTransformTarget = useCallback(() => {
    setTransformTarget(null);
    transformControls?.detach();
  }, [transformControls]);

  useEffect(() => {
    if (!transformControls || !orbitControls) return;
    orbitControls.target = orbitTargetRef.current;
    setTransformTarget(CAMERA_TRANSFORM_TARGET);
    // setCameraTargetTransformTarget();
    function disableOrbitOnTransform() {
      const callback = (event: any) => (orbitControls.enabled = !event.value);
      transformControls.addEventListener("dragging-changed", callback);
      return () =>
        transformControls.removeEventListener("dragging-changed", callback);
    }

    return disableOrbitOnTransform();
  }, [orbitControls, transformControls]);

  const transformComplete = useCallback(() => {
    if (!transformControls) return;

    // @ts-ignore
    const position = transformControls.object.position as Vector3;

    setOrbitTargetPosition(position.toArray());
  }, [transformControls]);

  const visible = !isAnimating;

  return (
    <>
      <DreiOrbitControls
        makeDefault
        // @ts-ignore
        ref={setOrbitControls}
        enabled={!isAnimating}
        visible={visible}
      />
      <DreiTransformControls
        mode={"translate"}
        // @ts-ignore
        ref={setTransformControls}
        enabled={visible}
        visible={visible}
        showX={visible}
        showY={visible}
        showZ={visible}
        onMouseUp={transformComplete}
      />
      {/* /camera target */}
      <mesh
        ref={cameraTarget}
        onClick={() => setTransformTarget(CAMERA_TRANSFORM_TARGET)}
        onPointerMissed={clearTransformTarget}
        visible={!isAnimating}
      >
        <boxBufferGeometry />
        <meshBasicMaterial color={0xff0000} />
      </mesh>
      <CameraTrackCurve
        trackPoints={trackObjects}
        transformControls={transformControls}
        startingPoints={startingPoints}
        cameraTarget={cameraTarget}
        loopTime={looptime}
        isAnimating={isAnimating}
      />
      {startingPoints.map((point, i) => (
        <CameraTrackPoint
          key={i}
          index={i}
          startingPosition={point}
          transformTarget={transformTarget}
          trackPoints={trackObjects}
          attachControlsTo={attachControlsTo}
          setTransformTarget={setTransformTarget}
          visible={!isAnimating}
        />
      ))}
    </>
  );
};

export default AnimatedCameraControls;
