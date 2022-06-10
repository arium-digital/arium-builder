import { Text, GradientTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { EditorContext } from "Space/InSpaceEditor/hooks/useEditorState";
import { getPositionalAudioVolume } from "hooks/usePeerPositionalAudio";
import { range } from "lodash";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
  useContext,
  Fragment,
  memo,
} from "react";
import { PositionalAudioConfig, Transform } from "spaceTypes";
import { BufferGeometry, DoubleSide, Group, Vector3, Raycaster } from "three";
import * as sectionKeys from "Editor/activeEditorKeys";
import { DEFAULT_AUDIO_MAX_DISTANCE } from "defaultConfigs/useDefaultNewElements";
import { GROUND_DETECTION_LAYER } from "config";

type VolumeAtPoint = {
  radius: number;
  volume: number;
};

type GradientParams = {
  stops: number[];
  colors: string[];
};

function compareNumbers(a: number, b: number) {
  return a - b;
}

const DistanceCylinder = ({
  positionalAudio,
  maxPlayDistance,
}: {
  positionalAudio: PositionalAudioConfig;
  maxPlayDistance: number;
}) => {
  const [geo, setGeo] = useState<BufferGeometry | null>(null);

  const [gradientParams, setGradientParams] = useState<GradientParams>();

  useEffect(() => {
    if (geo) {
      // const maxDistanceSquared = maxPlayDistance * maxPlayDistance;
      const pos = geo.attributes.position;
      var v3 = new Vector3();
      for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        const distance = Math.sqrt(Math.pow(v3.x, 2) + Math.pow(v3.y, 2));
        const distanceToEnd = distance / maxPlayDistance;
        geo.attributes.uv.setXY(i, 0, 1 - distanceToEnd);
      }

      geo.attributes.uv.needsUpdate = true;
    }
  }, [geo, maxPlayDistance]);

  useEffect(() => {
    const maxCount = 20;

    const stops: number[] = [];
    const colors: string[] = [];

    const minHue = 100;
    const maxHue = 200;

    for (let i = 0; i <= maxCount; i++) {
      const percentage = i / maxCount;
      const distance = percentage * maxPlayDistance;

      let volume: number;

      if (distance > maxPlayDistance) volume = 0;
      else {
        volume = getPositionalAudioVolume(distance * distance, positionalAudio);
      }

      const h = minHue + (maxHue - minHue) * volume;

      const stop = percentage;
      const color = `hsl(${h}, 100%, ${volume * 50}%)`;

      stops.push(stop);
      colors.push(color);
    }

    setGradientParams({
      stops,
      colors,
    });
  }, [positionalAudio, maxPlayDistance]);

  if (!gradientParams) return null;

  return (
    <mesh rotation-x={Math.PI / 2}>
      <meshBasicMaterial
        // map={distanceTexture}
        side={DoubleSide}
        transparent
        opacity={0.8}
      >
        <GradientTexture {...gradientParams} size={1024} />
      </meshBasicMaterial>
      <circleBufferGeometry args={[maxPlayDistance, 32]} ref={setGeo} />
    </mesh>
  );
};

type PositionalAudioHelperProps = {
  positionalAudioConfig: PositionalAudioConfig;
  maxPlayDistance?: number;
  elementTransform: Transform | undefined;
  audio: HTMLMediaElement | null;
  alwaysShow?: boolean;
};

const PositionalAudioHelper = memo(
  ({
    positionalAudioConfig,
    elementTransform,
    audio,
    maxPlayDistance = DEFAULT_AUDIO_MAX_DISTANCE,
  }: PositionalAudioHelperProps) => {
    // const groupRef = useRef<Object3D>();

    const [groupRef, setGroupRef] = useState<Group | null>(null);

    const [points, setPoints] = useState<VolumeAtPoint[]>();

    const { scene } = useThree();

    const [position, setPosition] = useState<Vector3>(new Vector3(0, 0, 0));
    const [scale, setScale] = useState<Vector3>(new Vector3(1, 1, 1));

    const [groundRaycaster] = useState(() => {
      const raycaster = new Raycaster();
      raycaster.layers.disableAll();
      raycaster.layers.enable(GROUND_DETECTION_LAYER);
      raycaster.far = 100;

      return raycaster;
    });

    useLayoutEffect(() => {
      if (!groupRef) return;

      const worldScale = new Vector3();

      groupRef.getWorldScale(worldScale);

      const worldNeutralScale = new Vector3(1, 1, 1);

      const scale = worldNeutralScale.clone().divide(worldScale);

      setScale(scale);
      // const worldScale = new Vector3();
      const worldPosition = new Vector3();

      groupRef.getWorldPosition(worldPosition);

      const downVector = new Vector3(0, -1, 0);

      groundRaycaster.set(worldPosition, downVector);

      const intersections = groundRaycaster.intersectObjects(
        scene.children,
        true
      );

      let targetY: number;

      const elementY = worldPosition.y || 0;

      if (intersections.length === 0) {
        targetY = -elementY;
      } else {
        const distances = intersections.map((x) => x.distance);
        distances.sort(compareNumbers);
        targetY = -distances[0];
      }

      const position = new Vector3(0, targetY * scale.y + 0.05, 0);
      setPosition(position);
    }, [groupRef, elementTransform, scene, groundRaycaster]);

    useEffect(() => {
      if (positionalAudioConfig.mode === "global") {
        setPoints(undefined);
        return;
      }
      const refDistance = positionalAudioConfig.refDistance || 10;
      const maxPlayDistanceSquare = maxPlayDistance * maxPlayDistance;
      const pointMarks = range(refDistance, maxPlayDistance, 5);
      const points = pointMarks
        .map((mark) => {
          const distSquared = mark * mark;
          let volume: number;
          if (distSquared > maxPlayDistanceSquare) {
            volume = 0;
          } else {
            volume = getPositionalAudioVolume(
              distSquared,
              positionalAudioConfig
            );
          }

          return {
            radius: mark,
            volume,
          };
        })
        .filter(({ volume: level }) => Math.floor(level * 100) > 0);

      setPoints(points);
    }, [positionalAudioConfig, maxPlayDistance]);

    const halfRotation = Math.PI / 2;
    const fullCircle = Math.PI * 2;

    return (
      <group ref={setGroupRef}>
        <group position-y={position.y}>
          <group scale={scale}>
            {points?.map(({ radius, volume: level }, i) => (
              <Fragment key={i}>
                <mesh rotation-x={halfRotation}>
                  <meshBasicMaterial
                    color="red"
                    transparent
                    opacity={level}
                    side={DoubleSide}
                  />
                  <torusBufferGeometry args={[radius, 0.05, 8, 64]} />
                </mesh>
                <group rotation-y={(fullCircle * i) / 10}>
                  {range(1, 3).map((corner) => {
                    const text = `${Math.round(level * 100)}% volume`;
                    return (
                      <>
                        <group
                          rotation-y={fullCircle * (corner / 2)}
                          position-y={2}
                        >
                          <Text
                            position-z={radius}
                            rotation-y={Math.PI}
                            color="white"
                            outlineColor={"black"}
                            outlineWidth={0.005}
                            fontSize={1}
                          >
                            {text}
                          </Text>
                        </group>
                      </>
                    );
                  })}
                </group>
              </Fragment>
            ))}
            {positionalAudioConfig.mode !== "global" && (
              <Suspense fallback={null}>
                <DistanceCylinder
                  positionalAudio={positionalAudioConfig}
                  maxPlayDistance={maxPlayDistance}
                />
              </Suspense>
            )}
          </group>
        </group>
      </group>
    );
  }
);

const PositionalAudioHelperWrapper = (props: PositionalAudioHelperProps) => {
  const show =
    !!useContext(EditorContext)?.activeEditors[
      sectionKeys.SPATIAL_AUDIO_SETTINGS
    ] || !!props.alwaysShow;

  if (!show) return null;

  return <PositionalAudioHelper {...props} />;
};

export default PositionalAudioHelperWrapper;
