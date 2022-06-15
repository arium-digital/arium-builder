import { store } from "db";
import { defaultExperimentalCameraSettings } from "defaultConfigs";
import { merge } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import { ExperimentalCameraConfig } from "types";
import { HasSpaceId } from "../InSpaceEditor/types";
import { SpaceContext } from "hooks/useCanvasAndModalContext";

const AnimateCameraFarAndFov = ({
  target,
  camera,
  onAnimationFinish,
}: {
  camera: PerspectiveCamera;
  target: Required<ExperimentalCameraConfig>;
  onAnimationFinish: () => void;
}) => {
  const { fovIncrePerFrame, farIncrePerFrame } = useMemo(() => {
    const secondsPerFrame = 1 / 60;
    const fovDiff = target.fov - camera.fov;
    const farDiff = target.far - camera.far;
    const fovIncrePerFrame =
      fovDiff / (Math.max(target.fovTransitionSpeed, 0.1) / secondsPerFrame);
    const farIncrePerFrame =
      farDiff / (Math.max(target.farTransitionSpeed, 0.1) / secondsPerFrame);
    return {
      fovDiff,
      farDiff,
      fovIncrePerFrame,
      farIncrePerFrame,
    };
  }, [camera, target]);
  useFrame(() => {
    const currentFovAbsDiff = Math.abs(camera.fov - target.fov);
    const currentFarAbsDiff = Math.abs(camera.far - target.far);
    const fovAnimationFinished =
      currentFovAbsDiff <= Math.max(Math.abs(fovIncrePerFrame), 0.1);
    const farAnimationFinished =
      currentFarAbsDiff <= Math.max(Math.abs(farIncrePerFrame), 0.1);

    if (fovAnimationFinished && farAnimationFinished) {
      onAnimationFinish();
      return;
    }
    if (!fovAnimationFinished) camera.fov += fovIncrePerFrame;
    if (!farAnimationFinished) camera.far += farIncrePerFrame;
    camera.updateProjectionMatrix();
  });

  return null;
};
const ExperimentalCameraControllerInner = ({ spaceId }: HasSpaceId) => {
  const camera = useThree().camera;
  const defaultCameraConfig = useMemo(defaultExperimentalCameraSettings, []);
  const [animationFinished, setAnimationFinished] = useState(true);
  const handleAnimationFinish = useCallback(() => {
    setAnimationFinished(true);
  }, []);
  const [target, setTarget] = useState<Required<ExperimentalCameraConfig>>(
    defaultCameraConfig
  );
  useEffect(() => {
    const unsub = store
      .collection("spaces")
      .doc(spaceId)
      .collection("settings")
      .doc("camera")
      .onSnapshot((cameraConfig) => {
        const config = cameraConfig.data() as ExperimentalCameraConfig;
        setTarget(merge({}, defaultCameraConfig, config));
        setAnimationFinished(false);
      });
    return () => {
      unsub();
    };
  }, [camera, defaultCameraConfig, spaceId]);
  if (animationFinished) return null;
  if (camera.type !== "PerspectiveCamera") return null;

  return (
    <AnimateCameraFarAndFov
      camera={camera}
      onAnimationFinish={handleAnimationFinish}
      target={target}
    />
  );
};
export const ExperimentalCameraController = ({ spaceId }: HasSpaceId) => {
  // if (!spaceSettings?.experimental?.cameraControls) return null;
  return (
    <SpaceContext.Consumer>
      {(spaceContext) =>
        !!spaceContext?.spaceSettings?.experimental?.cameraControls && (
          <ExperimentalCameraControllerInner spaceId={spaceId} />
        )
      }
    </SpaceContext.Consumer>
  );
};
