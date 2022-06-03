import React, { useContext, useEffect, useRef, useState } from "react";
// import { render } from "react-dom";

// import * as mediasoupClient from "mediasoup-client";
import {
  PeerConsumers,
  PeerPlayerPositions,
  PeersSettings,
  PlayerLocation,
} from "../types";
import Environment from "./EnvironmentAndFodAndAmbientLight";

import { Canvas, useThree } from "@react-three/fiber";
import styles from "../css/space.module.scss";

// import { SceneControls } from "./Controls/SceneControls";
// import Elements from "./Elements";
import {
  Camera,
  sRGBEncoding,
  Scene,
  Vector3,
  PCFSoftShadowMap,
  PCFShadowMap,
  BasicShadowMap,
  VSMShadowMap,
} from "three";

import { UserInfo, PeerAndDistance } from "../communicationTypes";
import SetRaycasterFromMouse from "./SetRaycasterFromMouse";
// import useSharedMedia from "../hooks/useSharedMedia";
import { ControlsSettings, IJoystickUpdateEvent } from "./componentTypes";
import // useBroadcasters,
// useMediaFromBroadcasters,
"../hooks/useBroadcasters";
import { EnvironmentConfig, IVector3, SpawnConfig } from "../spaceTypes";
// import useActivePresence from "../hooks/useActivePresence";
// import KeyboardMovementControls from "./Controls/KeyboardMovementControls";
import SetCameraInitialLookAtAndInitialPosition from "./Controls/SetCameraInitialLookAtAndInitialPosition";
// import useMeshes from "../hooks/useMeshes";
import { defaultGraphicsConfig, defaultSpawnConfig } from "../defaultConfigs";
import { useConfigOrDefault } from "../hooks/spaceHooks";
import { ShadowMapType } from "../spaceTypes/environment";
import { useMemo } from "react";
import { Observable } from "rxjs";
import PeerAvatars from "./Consumers/PeerAvatars";
import useMeshes from "../hooks/useMeshes";
import ElementsTree from "./Elements/Tree/ElementsTree";
import { useAttachCameraToListener } from "../hooks/useListener";
import PositionPreview from "./Controls/PositionPreview";
import StatsWithShortcut from "./Controls/StatsWithShortcut";
import { useGlobalPointerOverObject$ } from "hooks/useGlobalPointerOver";
import AnimatedCameraControls from "./Controls/AnimatedCameraControls";
import { ExperimentalCameraController } from "./Controls/ExperimentalCameraController";
import useEnvironment from "hooks/useEnvironment";
import PostProcessing from "./PostProcessing";
import { AdaptiveDpr, useContextBridge } from "@react-three/drei";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import dynamic from "next/dynamic";
import InSpaceControls from "./Controls/InSpaceControls";
import { EditorContext } from "./InSpaceEditor/hooks/useEditorState";
import { Context as WagmiContext } from "wagmi";
import { SpaceAccessContext } from "hooks/auth/useSpaceAccess";
import { UpdateRemotePlayerStateFromPositionAndCameraLookAt } from "./Controls/SyncCameraPositionAndPlayerState";
import ThreeContext from "./ThreeContext";

const MaxxiValentinaElements = dynamic(() => import("./Boids"));

export type SetScene = ({
  scene,
  camera,
}: {
  scene: Scene;
  camera: Camera;
}) => void;

const randomBetween = (min: number, max: number) => {
  const range = max - min;

  const randomValue = Math.random() * range;

  return min + randomValue;
};

export const toInitialPosition = ({
  initialX,
  initialY,
  initialZ,
  spawnConfigOrigin,
  spawnConfigRadius,
}: {
  initialX?: number | null;
  initialY?: number | null;
  initialZ?: number | null;
  spawnConfigOrigin: IVector3 | undefined | null;
  spawnConfigRadius: number | undefined | null;
}): Vector3 => {
  if (initialX || initialY || initialZ)
    return new Vector3(initialX || 0, initialY || 0, initialZ || 0);

  const defaultConfig = defaultSpawnConfig();

  const origin = {
    ...(defaultConfig.origin as IVector3),
    ...(spawnConfigOrigin || {}),
  };

  const radius = spawnConfigRadius || defaultConfig.radius || 5;

  const values = {
    x: origin.x + randomBetween(-radius, radius),
    y: origin.y,
    z: origin.z + randomBetween(-radius, radius),
  };

  return new Vector3(values.x, values.y, values.z);
};

const toInitialLookAt = ({
  initialLookAtX,
  initialLookAtY,
  initialLookAtZ,
  spawnConfigLookAt,
}: {
  initialLookAtX?: number | null;
  initialLookAtY?: number | null;
  initialLookAtZ?: number | null;
  spawnConfigLookAt: IVector3 | undefined | null;
}): Vector3 => {
  if (initialLookAtX || initialLookAtY || initialLookAtZ)
    return new Vector3(
      initialLookAtX || 0,
      initialLookAtY || 0,
      initialLookAtZ || 0
    );

  const defaultConfig = defaultSpawnConfig();

  const lookAt = {
    ...(defaultConfig.lookAt as IVector3),
    ...(spawnConfigLookAt || {}),
  };

  return new Vector3(lookAt.x, lookAt.y, lookAt.z);
};

export const toInitialPositionAndLookAt = ({
  initialX,
  initialY,
  initialZ,
  initialLookAtX,
  initialLookAtY,
  initialLookAtZ,
  spawnConfig,
}: {
  initialX?: number | null;
  initialY?: number | null;
  initialZ?: number | null;
  initialLookAtX?: number | null;
  initialLookAtY?: number | null;
  initialLookAtZ?: number | null;
  spawnConfig: SpawnConfig | undefined;
}): { initialPosition: Vector3; initialLookAt: Vector3 } => {
  const initialPosition = toInitialPosition({
    initialX,
    initialY,
    initialZ,
    spawnConfigOrigin: spawnConfig?.origin,
    spawnConfigRadius: spawnConfig?.radius,
  });

  const initialLookAt = toInitialLookAt({
    initialLookAtX,
    initialLookAtY,
    initialLookAtZ,
    spawnConfigLookAt: spawnConfig?.lookAt,
  });

  return {
    initialPosition,
    initialLookAt,
  };
};

type SceneContainerWrapperProps = {
  spaceId: string;
  sessionId: string | undefined;
  userId: string | undefined;
  updatePlayerLocation: (playerState: PlayerLocation) => void;
  playerLocation$: Observable<PlayerLocation>;
  visiblePeersSortedByDistance$: Observable<PeerAndDistance[]>;
  peerLocations$: Observable<PeerPlayerPositions>;
  peersSettings$: Observable<PeersSettings>;
  render: boolean;
  initialX?: number;
  initialY?: number;
  initialZ?: number;
  initialLookAtX?: number;
  initialLookAtY?: number;
  initialLookAtZ?: number;
  controlsSettings?: ControlsSettings;
  enteredSpace: boolean;
  spaceId$: Observable<string>;
  sessionId$: Observable<string | undefined>;
  joystickMoveRef: React.MutableRefObject<IJoystickUpdateEvent | undefined>;
  documentation?: boolean;
  peerConsumers: PeerConsumers;
  loadingComplete: boolean;
  setLoadedProgress: (progress: number) => void;
};

type SceneContainerProps = SceneContainerWrapperProps & {
  environment: EnvironmentConfig | undefined;
};

const SceneContainer = ({
  spaceId,
  sessionId,
  userId,
  updatePlayerLocation,
  // communicators,
  render,
  initialX,
  initialY,
  initialZ,
  initialLookAtX,
  initialLookAtY,
  initialLookAtZ,
  controlsSettings,
  peerLocations$,
  peersSettings$,
  playerLocation$,
  visiblePeersSortedByDistance$,
  enteredSpace,
  environment,
  spaceId$,
  sessionId$,
  joystickMoveRef,
  documentation,
  peerConsumers,
  loadingComplete,
  setLoadedProgress,
}: SceneContainerProps) => {
  const { camera, gl, scene } = useThree();
  const setThree = useContext(ThreeContext)?.setThree;
  const { listener$, avatarMeshes } = useContext(SpaceContext) || {};
  useEffect(() => {
    if (setThree) {
      setThree({
        camera,
        scene,
        gl,
      });
    }
  }, [camera, gl, scene, setThree]);

  const [userInfo, setUserInfo] = useState<UserInfo>();

  useEffect(() => {
    // console.log({
    //   ksessionId: !!sessionId, spaceId: !!spaceId, userId: !!userId
    // });
    if (spaceId && userId)
      setUserInfo({
        spaceId,
        sessionId,
        userId,
      });
    else {
      setUserInfo(undefined);
    }
  }, [sessionId, spaceId, userId]);

  const { initialPosition, initialLookAt } = useMemo(() => {
    if (!environment)
      return {
        initialPosition: undefined,
        initialLookAt: undefined,
      };
    return toInitialPositionAndLookAt({
      initialX,
      initialY,
      initialZ,
      initialLookAtX,
      initialLookAtY,
      initialLookAtZ,
      spawnConfig: environment?.spawn,
    });
  }, [
    environment,
    initialX,
    initialY,
    initialZ,
    initialLookAtX,
    initialLookAtY,
    initialLookAtZ,
  ]);

  const position = useRef(initialPosition);

  const { meshes, updateMeshes } = useMeshes();

  useAttachCameraToListener({ listener$ });
  // const peerDeviceOrientations$ = useObservePeerDeviceOrientations({
  //   spaceId$,
  //   sessionId$,
  //   activeSessions$,
  // });

  const cameraOffset = avatarMeshes?.cameraPosition;
  const isMaxxiSpace = useMemo(() => {
    return ["better", "chance", "gain", "enough", "entropy"].includes(
      spaceId.toLowerCase()
    );
  }, [spaceId]);

  useGlobalPointerOverObject$();
  return (
    <>
      <StatsWithShortcut />
      <SetRaycasterFromMouse />
      {!controlsSettings?.disableKeyboardControls && (
        <PositionPreview playerLocation$={playerLocation$} />
      )}
      {!controlsSettings?.disableMovementControls &&
        initialLookAt &&
        initialPosition &&
        cameraOffset && (
          <>
            <SetCameraInitialLookAtAndInitialPosition
              initialLookAt={initialLookAt}
              initialPosition={initialPosition}
              position={position}
              cameraOffset={cameraOffset}
            />
            {enteredSpace && loadingComplete && (
              <>
                {documentation ? (
                  <>
                    <AnimatedCameraControls />
                  </>
                ) : (
                  <>
                    <InSpaceControls
                      meshes={meshes}
                      controlsSettings={controlsSettings}
                      joystickMoveRef={joystickMoveRef}
                      position={position}
                      cameraOffset={cameraOffset}
                    />
                    {updatePlayerLocation && (
                      <UpdateRemotePlayerStateFromPositionAndCameraLookAt
                        position={position}
                        updatePlayerState={updatePlayerLocation}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      {render && (
        <>
          {userInfo && spaceId && (
            <>
              <group visible={loadingComplete && enteredSpace}>
                <ExperimentalCameraController spaceId={spaceId} />
                <Environment
                  environment={environment}
                  visible={loadingComplete && enteredSpace}
                />
                <ElementsTree
                  spaceId={spaceId}
                  userInfo={userInfo}
                  meshesChanged={updateMeshes}
                  playerPositionRef={position}
                  documentationMode={documentation}
                  handleProgressChanged={setLoadedProgress}
                />
              </group>
            </>
          )}
          {isMaxxiSpace && <MaxxiValentinaElements spaceId={spaceId} />}
          <SpaceContext.Consumer>
            {(spaceContext) =>
              spaceContext?.activeSessions$ &&
              spaceContext?.consumers$ &&
              spaceContext?.sessionPaths$ && (
                <PeerAvatars
                  activeSessions$={spaceContext.activeSessions$}
                  consumers$={spaceContext.consumers$}
                  peerPositions$={peerLocations$}
                  visiblePeersSortedByDistance$={visiblePeersSortedByDistance$}
                  peersSettings$={peersSettings$}
                  spaceId$={spaceId$}
                  sessionId$={sessionId$}
                  spaceId={spaceId}
                  avatarMeshes={avatarMeshes}
                  peerConsumers={peerConsumers}
                  sessionPaths$={spaceContext?.sessionPaths$}
                  // peersMetadata={spaceContext?.peersMetadata}
                />
              )
            }
          </SpaceContext.Consumer>

          {/* {!documentation && <SelfAvatar metadata={selfMetadata} />} */}
        </>
      )}
    </>
  );
};

export const toShadowMapType = (typeString: ShadowMapType | undefined) => {
  if (typeString === "BasicShadowMap") return BasicShadowMap;
  if (typeString === "PCFShadowMap") return PCFShadowMap;
  if (typeString === "PCFSoftShadowMap") return PCFSoftShadowMap;
  if (typeString === "VSMShadowMap") return VSMShadowMap;

  return PCFShadowMap;
};

const SceneContainerWrapper = (props: SceneContainerWrapperProps) => {
  const environment = useEnvironment({ spaceId: props.spaceId });

  const graphicsConfig = useConfigOrDefault(
    environment?.defaultGraphics,
    defaultGraphicsConfig
  );

  const shadowMapType = useMemo(
    () => toShadowMapType(graphicsConfig.shadowMapType),
    [graphicsConfig.shadowMapType]
  );

  // const ctx = useContext(Web3Context);

  // const library = ctx.library;

  // useEffect(() => {
  //   if (library)
  //     console.log('library', library);

  // }, [library])

  const ContextBridge = useContextBridge(
    SpaceContext,
    EditorContext,
    WagmiContext,
    SpaceAccessContext,
    ThreeContext
  );

  // const web3React = useWeb3React<Web3Provider>();

  // const getLibrary = useCallback(() => {
  //   return new Web3Provider(web3React.)

  // const useEthersContext = useMemo(() => {
  //   const useEthers = () => {
  //     return sourceUseEthers();
  //   };

  //   return { useEthers }
  // }, []);

  // const Web3ReactContext = getWeb3ReactContext()

  // }, [web3React]);
  // const enableWeb3 = useShouldWeb3BeEnabled({ spaceId: props.spaceId });

  return (
    <Canvas
      // mode="concurrent"
      output-encoding={{ sRGBEncoding }}
      shadows={{ enabled: true, type: shadowMapType }}
      className={styles.sphericalDragCanvas}
      performance={{ min: 0.5 }}
    >
      <PostProcessing spaceId={props.spaceId} />
      <ContextBridge>
        <SceneContainer {...props} environment={environment} />
      </ContextBridge>
      <AdaptiveDpr pixelated />
    </Canvas>
  );
};

export default SceneContainerWrapper;
