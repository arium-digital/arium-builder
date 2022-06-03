import React, {
  ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Color, Mesh, Object3D, Quaternion, Vector3 } from "three";
import { Observable } from "rxjs";
import { useBehaviorSubjectFromCurrentValue } from "../../hooks/useObservable";
import { ModerationState } from "hooks/usePeerModerationContrrols";
import usePeerInSpace, { QuaternionUpdate } from "hooks/usePeerInSpace";
import { AggregateObservedConsumers, PeersMetaData } from "communicationTypes";
import {
  PeerConsumers,
  PeerPlayerPositions,
  PlayerPosition,
  PlayerQuaternion,
} from "types";
import { useSpring } from "react-spring";
import { PLAYER_UPDATE_INTERVAL } from "hooks/useUpdateRemotePlayerPosition";
import { METADATA_KEYS } from "hooks/usePeersMetadata";
import AvatarCameraSurfaces from "./AvatarCameraSurfaces";
import { NameDisplay } from "./AvatarMesh";
import { distanceSquared } from "hooks/usePlayerLocations";
import { SessionPaths } from "shared/dbPaths";
import useRequestConsumersForPeer from "components/Consumers/hooks/useRequestsConsumersForPeer";
import { ErrorBoundary } from "react-error-boundary";

const SetPositionFromTargets = ({
  object3d,
  targetPosition,
  targetQuaternion,
}: {
  object3d: Object3D;
  targetPosition: PlayerPosition;
  targetQuaternion: PlayerQuaternion;
}) => {
  useEffect(() => {
    object3d.position.set(...targetPosition);
  }, [object3d, targetPosition]);
  useEffect(() => {
    object3d.quaternion.set(...targetQuaternion);
  }, [object3d, targetQuaternion]);

  return null;
};

const RESET_DISTANCE = 20;
const RESET_DISTANCE_SQUARED = RESET_DISTANCE * RESET_DISTANCE;

const AnimatePositionFromTargets = ({
  object3d,
  targetPosition,
  targetQuaternion,
}: {
  object3d: Object3D;
  targetPosition: PlayerPosition;
  targetQuaternion: PlayerQuaternion;
}) => {
  const [{ initialPosition, reset }, setInitialPositionAndReset] = useState({
    initialPosition: targetPosition,
    reset: false,
  });

  useSpring({
    from: {
      x: initialPosition[0],
      y: initialPosition[1],
      z: initialPosition[2],
    },
    to: {
      x: targetPosition[0],
      y: targetPosition[1],
      z: targetPosition[2],
    },
    config: {
      duration: PLAYER_UPDATE_INTERVAL,
    },
    reset,
    onChange: (result) => {
      object3d.position.set(result.value.x, result.value.y, result.value.z);
    },
  });

  useEffect(() => {
    object3d.position.set(...initialPosition);
  }, [initialPosition, object3d]);

  const resetIfShould = useCallback(() => {
    const getShouldReset = () => {
      const distanceBetween = distanceSquared(
        targetPosition,
        object3d.position.toArray()
      );
      return distanceBetween >= RESET_DISTANCE_SQUARED;
    };

    if (getShouldReset()) {
      setInitialPositionAndReset({
        initialPosition: targetPosition,
        reset: true,
      });
      setTimeout(() => {
        setInitialPositionAndReset({
          initialPosition: targetPosition,
          reset: false,
        });
      });
      object3d.position.set(...targetPosition);
    }
  }, [object3d, targetPosition]);

  useEffect(() => {
    resetIfShould();

    const interval = setInterval(() => {
      resetIfShould();
    }, 5000);

    return () => clearInterval(interval);
  }, [resetIfShould]);

  useEffect(() => {
    if (!targetQuaternion) return;

    const target = new Quaternion(...targetQuaternion);

    let animationFrame: number;

    const animate = () => {
      object3d.quaternion.slerp(target, 0.05);

      if (object3d.quaternion.angleTo(target) <= 0.01) {
        object3d.quaternion.set(...targetQuaternion);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [object3d, targetQuaternion]);

  return null;
};

interface InstanceProps {
  position?: Vector3;
  // up?: import("@react-three/fiber").Vector3 | undefined;
  scale?: Vector3;
  color?: Color;
  ["scale-x"]?: number;
  ["scale-y"]?: number;
  ["scale-z"]?: number;
  // rotation?: import("@react-three/fiber").Euler | undefined;
  // matrix?: import("@react-three/fiber").Matrix4 | undefined;
  // quaternion?: import("@react-three/fiber").Quaternion | undefined;
  // layers?: import("@react-three/fiber").Layers | undefined;
  // dispose?: (() => void) | null | undefined
}

export type InstancedComponent = ComponentType<InstanceProps>;

export type PositionedAvatarProps = {
  sessionId: string;
  visiblePeers$: Observable<Set<string>>;
  tweenedPeers$: Observable<Set<string>>;
  textVisiblePeers$: Observable<Set<string>>;
  consumers$: Observable<AggregateObservedConsumers>;
  peerPositions$: Observable<PeerPlayerPositions>;
  peerMetadata$: Observable<PeersMetaData | undefined>;
  instancedMeshes: InstancedComponent[];
  playerQuaternions$: Observable<QuaternionUpdate>;
  moderation: ModerationState;
  volume?: number;
  children?: React.ReactChild | undefined;
  bodyScaleOverride?: number;
  cameraSurfaces: Mesh[];
  namePosition: Vector3;
  peerConsumers: PeerConsumers;
  sessionPaths$: Observable<SessionPaths | undefined>;
};

const PositionedAvatar = ({
  sessionId,
  visiblePeers$,
  tweenedPeers$,
  textVisiblePeers$,
  consumers$,
  peerPositions$,
  peerMetadata$,
  playerQuaternions$,
  moderation,
  volume,
  children,
  instancedMeshes,
  bodyScaleOverride,
  cameraSurfaces,
  namePosition,
  peerConsumers,
  sessionPaths$,
}: PositionedAvatarProps) => {
  const [object3dRef, setObject3dRef] = useState<Object3D | null>(null);

  const {
    avatar,
    visible,
    targetPosition,
    targetQuaternion,
    animate,
    textVisible,
  } = usePeerInSpace({
    consumers$,
    peerMetadata$,
    peerPositions$,
    playerQuaternions$,
    sessionId,
    visiblePeers$,
    tweenedPeers$,
    textVisiblePeers$,
  });

  const [onClickHandler, setOnClick] = useState<{ onClick: () => void }>();

  const peerId$ = useBehaviorSubjectFromCurrentValue(sessionId);

  useEffect(() => {
    if (!moderation.enable) setOnClick(undefined);

    const onClick = () => {
      if (!sessionId) return;
      moderation.selectPeer(sessionId);
    };
    setOnClick({ onClick });
  }, [moderation, moderation.enable, moderation.selectPeer, sessionId]);

  const { metadata } = avatar;

  const bodyColorValue = metadata?.[METADATA_KEYS.bodyColor];
  const color = useMemo(() => {
    if (!bodyColorValue) return undefined;
    return new Color(bodyColorValue);
  }, [bodyColorValue]);

  useRequestConsumersForPeer({
    peerConsumers,
    sessionPaths$,
    peerId$,
  });

  // const shouldBeVisible = !!(targetQuaternion && targetPosition && visible);

  // console.log({ shouldBeVisible, targetQuaternion, targetPosition, visible, color });

  return (
    <group
      visible={visible}
      ref={setObject3dRef}
      onClick={onClickHandler?.onClick}
    >
      {object3dRef && targetQuaternion && targetPosition && (
        <>
          {!animate && (
            <SetPositionFromTargets
              object3d={object3dRef}
              targetPosition={targetPosition}
              targetQuaternion={targetQuaternion}
            />
          )}
          {animate && (
            <AnimatePositionFromTargets
              object3d={object3dRef}
              targetPosition={targetPosition}
              targetQuaternion={targetQuaternion}
            />
          )}
        </>
      )}
      <AvatarCameraSurfaces
        cameraTexture={avatar.textureToUse}
        meshes={cameraSurfaces}
      />
      {children}
      {visible && (
        <>
          {instancedMeshes.map((InstancedMesh, i) => (
            <InstancedMesh key={i} color={color} />
          ))}
        </>
      )}
      {metadata && metadata[METADATA_KEYS.name] && (
        <group position={namePosition}>
          <NameDisplay
            name={metadata[METADATA_KEYS.name]}
            visible={textVisible}
          />
        </group>
      )}
    </group>
  );
};

const PositionedAvatarWithBoundary = (props: PositionedAvatarProps) => {
  return (
    <ErrorBoundary
      fallback={<group></group>}
      resetKeys={[props.sessionId, props.cameraSurfaces, props.peerConsumers]}
    >
      <PositionedAvatar {...props} />
    </ErrorBoundary>
  );
};

export default PositionedAvatarWithBoundary;
