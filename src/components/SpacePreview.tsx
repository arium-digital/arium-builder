import { defaultGraphicsConfig } from "defaultConfigs";
import { useAuthentication } from "hooks/auth/useAuthentication";
import { useConfigOrDefault } from "hooks/spaceHooks";
import useEnvironment from "hooks/useEnvironment";
import React, { useMemo, useRef, useEffect } from "react";
import { toInitialPosition, toShadowMapType } from "./SceneContainer";
import { Canvas, useThree } from "@react-three/fiber";
import {
  //   Camera,
  sRGBEncoding,
  //   Scene,
  //   Vector3,
  //   PCFSoftShadowMap,
  //   PCFShadowMap,
  //   BasicShadowMap,
  //   VSMShadowMap,
} from "three";
import KeyboardTurnControls from "./Controls/KeyboardTurnControls";
import FirstPersonKeyboardMovementControls from "./Controls/KeyboardMovementControls";
import ElementsTree from "./Elements/Tree/ElementsTree";
import useMeshes from "hooks/useMeshes";
import { EnvironmentConfig } from "spaceTypes";
import SphericalDragControls from "components/Controls/SphericalDragControls";
import SetRaycasterFromMouse from "components/SetRaycasterFromMouse";
import Environment from "components/Environment/EnvironmentAndFodAndAmbientLight";
import SyncCameraAndPlayerPosition from "./Controls/SyncCameraPositionAndPlayerState";
import spaceStyles from "css/space.module.scss";
import { FullScreenTopRightContainer } from "./Controls/FullScreenToggle";
import usePressedKeyboardKeys from "./Controls/useKeyboardMovementKeys";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import useMinimalSpaceContext from "hooks/useMinimalSpaceContext";
import { useElementsLoadedProgress } from "./Elements/Tree/useLoadedState";
import { AnimatedAriumLogo } from "./AnimatedAriumLogo";

const SpacePreview = ({
  spaceId,
  environment,
  setCanvas,
  loadingComplete,
  setLoadedProgress,
}: {
  spaceId: string;
  environment?: EnvironmentConfig;
  setCanvas?: (canvas: HTMLCanvasElement | null) => void;
  loadingComplete: boolean;
  setLoadedProgress: (progress: number) => void;
}) => {
  const position = useRef(
    toInitialPosition({
      initialX: null,
      initialY: null,
      initialZ: null,
      spawnConfigOrigin: environment?.spawn?.origin,
      spawnConfigRadius: environment?.spawn?.radius,
    })
  );

  const { gl } = useThree();

  useEffect(() => {
    if (setCanvas) setCanvas(gl.domElement as HTMLCanvasElement);
  }, [gl, setCanvas]);

  const spaceContext = useMinimalSpaceContext({ spaceId });

  const { meshes, updateMeshes } = useMeshes();

  const keyboardMovementKeys$ = usePressedKeyboardKeys();

  return (
    <>
      <SyncCameraAndPlayerPosition position={position} />
      <KeyboardTurnControls keyboardMovementKeys$={keyboardMovementKeys$} />
      {loadingComplete && (
        <FirstPersonKeyboardMovementControls
          positionRef={position}
          meshes={meshes}
          keyboardMovementKeys$={keyboardMovementKeys$}
        />
      )}
      <SpaceContext.Provider value={spaceContext}>
        <group visible={loadingComplete}>
          <ElementsTree
            spaceId={spaceId}
            meshesChanged={updateMeshes}
            playerPositionRef={position}
            handleProgressChanged={setLoadedProgress}
          />
        </group>
      </SpaceContext.Provider>
      {/* <FlyControls movementSpeed={3} rollSpeed={0} dragTo={false}Look /> */}
      {/* <PointerLockControls /> */}
      <SphericalDragControls />
      <SetRaycasterFromMouse />
      <Environment environment={environment} />
    </>
  );
};

const SpacePreviewWrapper = ({
  spaceId,
  setCanvas,
  fullScreenElement,
}: {
  spaceId: string;
  setCanvas?: (canvas: HTMLCanvasElement | null) => void;
  fullScreenElement: HTMLElement;
}) => {
  useAuthentication({ ensureSignedInAnonymously: false });
  const environment = useEnvironment({ spaceId });

  const graphicsConfig = useConfigOrDefault(
    environment?.defaultGraphics,
    defaultGraphicsConfig
  );

  const shadowMapType = useMemo(
    () => toShadowMapType(graphicsConfig.shadowMapType),
    [graphicsConfig.shadowMapType]
  );

  const {
    fullyLoaded,
    elementsLoadedProgress,
    setElementLoadedProgress,
  } = useElementsLoadedProgress();

  return (
    <>
      {!fullyLoaded && (
        <AnimatedAriumLogo
          showProgress
          progress={elementsLoadedProgress}
          hint="loading scene"
          height="100%"
        />
      )}
      <Canvas
        gl={{
          antialias: graphicsConfig.antialias,
        }}
        output-encoding={{ sRGBEncoding }}
        shadows={{ enabled: true, type: shadowMapType }}
        className={spaceStyles.sphericalDragCanvas}
      >
        <SpacePreview
          spaceId={spaceId}
          environment={environment}
          setCanvas={setCanvas}
          setLoadedProgress={setElementLoadedProgress}
          loadingComplete={fullyLoaded}
        />
      </Canvas>
      <FullScreenTopRightContainer fullScreenElement={fullScreenElement} />
    </>
  );
};

export default SpacePreviewWrapper;
