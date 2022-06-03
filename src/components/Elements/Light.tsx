import React, { useMemo, useState, useRef } from "react";
import {
  DirectionalLightConfig,
  IVector3,
  LightConfig,
  LightShadowConfig,
  SpotLightConfig,
} from "spaceTypes";

import {
  DirectionalLight,
  DirectionalLightHelper,
  Object3D,
  PointLight,
  PointLightHelper,
  SpotLight,
  SpotLightHelper,
} from "three";
import {
  DEFAULT_LIGHT_KIND,
  defaultDirectionalConfig,
  defaultLightConfig,
  defaultSpotLightConfig,
} from "defaultConfigs";
import { useHelper } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import { LightKind, PointLightConfig } from "spaceTypes/light";
import { useConfigOrDefaultRecursive } from "hooks/spaceHooks";

const toShadowProps = (
  castShadow: boolean | undefined,
  shadowConfig?: LightShadowConfig
) => {
  if (!castShadow) return {};

  const { mapSize = 1024, cameraSize = 150, cameraFar = 3500, bias = -0.0001 } =
    shadowConfig || {};

  return {
    castShadow,
    "shadow-mapSize-width": mapSize,
    "shadow-mapSize-height": mapSize,
    "shadow-camera-left": -cameraSize,
    "shadow-camera-right": cameraSize,
    "shadow-camera-top": cameraSize,
    "shadow-camera-bottom": -cameraSize,
    "shadow-camera-far": cameraFar,
    "shadow-bias": bias,
  };
};

const SpotLightHelperWrapper = ({ spotLight }: { spotLight: SpotLight }) => {
  const spotLightRef = useRef(spotLight);
  useHelper(spotLightRef, SpotLightHelper);
  return null;
};

const PointLightHelperWrapper = ({
  pointLight,
}: {
  pointLight: PointLight;
}) => {
  const pointLightRef = useRef(pointLight);
  const size = (1 + pointLight.intensity + pointLight.distance) * 0.1;
  useHelper(pointLightRef, PointLightHelper, size);
  return null;
};

const DirectionalLightHelperWrapper = ({
  directionalLight,
}: {
  directionalLight: DirectionalLight;
}) => {
  const directionalLightRef = useRef(directionalLight);
  useHelper(directionalLightRef, DirectionalLightHelper);

  return null;
};

const defaultPosition = {
  x: 0,
  y: 2,
  z: 0,
};

const defaultTarget = {
  x: 0,
  y: 0,
  z: 0,
};

const usePositionOrDefault = (position?: IVector3) => {
  const positionToUse: IVector3 = useMemo(
    () => ({
      ...defaultPosition,
      ...(position || {}),
    }),
    [position]
  );

  return positionToUse;
};

const useTargetOrDefault = (target?: IVector3) => {
  const targetToUse: IVector3 = useMemo(
    () => ({
      ...defaultTarget,
      ...(target || {}),
    }),
    [target]
  );

  return targetToUse;
};

const DirectionalLightWrapper = ({
  values,
  showHelper,
}: {
  values: DirectionalLightConfig;
  showHelper?: boolean;
}) => {
  const [
    directionalLight,
    setDirectionalLight,
  ] = useState<DirectionalLight | null>(null);
  const [targetObject3d] = useState(new Object3D());

  const { color, intensity } = values;

  const directional = useConfigOrDefaultRecursive(
    values.directional,
    defaultDirectionalConfig
  );

  const { castShadow, shadowConfig, target, position } = directional;

  const shadowProps = useMemo(() => toShadowProps(castShadow, shadowConfig), [
    castShadow,
    shadowConfig,
  ]);

  const positionToUse = usePositionOrDefault(position);
  const targetToUse = useTargetOrDefault(target);

  const spring = useSpring({
    to: {
      color,
      intensity,
      x: positionToUse.x,
      y: positionToUse.y,
      z: positionToUse.z,
      targetX: targetToUse.x,
      targetY: targetToUse.y,
      targetZ: targetToUse.z,
    },
  });

  return (
    <>
      {/* @ts-ignore */}
      <a.directionalLight
        color={spring.color}
        intensity={spring.intensity}
        position-x={spring.x}
        position-y={spring.y}
        position-z={spring.z}
        target={targetObject3d}
        {...shadowProps}
        ref={setDirectionalLight}
      />
      {directionalLight && (
        <a.primitive
          object={directionalLight.target}
          position-x={spring.targetX}
          position-y={spring.targetY}
          position-z={spring.targetZ}
        />
      )}
      {showHelper && directionalLight && (
        <DirectionalLightHelperWrapper directionalLight={directionalLight} />
      )}
    </>
  );
};

const SpotLightWrapper = ({
  values,
  showHelper,
}: {
  values: SpotLightConfig;
  showHelper?: boolean;
}) => {
  const [spotLight, setSpotLight] = useState<SpotLight | null>();
  const [targetObject] = useState<Object3D>(new Object3D());

  const { color, intensity } = values;

  const {
    castShadow,
    shadowConfig,
    target,
    position,
  } = useConfigOrDefaultRecursive(values.directional, defaultDirectionalConfig);

  const { distance, angle, penumbra, decay } = useConfigOrDefaultRecursive(
    values.spot,
    defaultSpotLightConfig
  );

  const shadowProps = useMemo(() => toShadowProps(castShadow, shadowConfig), [
    castShadow,
    shadowConfig,
  ]);

  const positionToUse = usePositionOrDefault(position);
  const targetToUse = useTargetOrDefault(target);

  const spring = useSpring({
    to: {
      color,
      intensity,
      x: positionToUse.x,
      y: positionToUse.y,
      z: positionToUse.z,
      angle,
      distance,
      penumbra,
      decay,
      targetX: targetToUse.x,
      targetY: targetToUse.y,
      targetZ: targetToUse.z,
    },
  });

  return (
    <>
      <a.spotLight
        /* common with directional light: */
        color={spring.color}
        intensity={spring.intensity}
        position-x={spring.x}
        position-y={spring.y}
        position-z={spring.z}
        target={targetObject}
        {...shadowProps}
        ref={setSpotLight}
        /* end common with directional light: */
        distance={spring.distance}
        angle={spring.angle}
        penumbra={spring.penumbra}
        decay={spring.decay}
      />
      {spotLight && (
        <a.primitive
          object={spotLight.target}
          position-x={spring.targetX}
          position-y={spring.targetY}
          position-z={spring.targetZ}
        />
      )}
      {showHelper && spotLight && (
        <SpotLightHelperWrapper spotLight={spotLight} />
      )}
    </>
  );
};

const PointLightWrapper = ({
  values: light,
  showHelper,
}: {
  values: PointLightConfig;
  showHelper?: boolean;
}) => {
  const [pointLight, setPointLight] = useState<PointLight | null>();

  const { color, intensity, decay, distance } = light;

  const spring = useSpring({
    to: {
      color,
      intensity,
      distance,
      decay,
    },
  });

  return (
    <>
      <a.pointLight
        /* common with directional light: */
        color={spring.color}
        intensity={spring.intensity}
        ref={setPointLight}
        distance={spring.distance}
        decay={spring.decay}
      />
      {showHelper && pointLight && (
        <PointLightHelperWrapper pointLight={pointLight} />
      )}
    </>
  );
};

const Light = ({
  config,
  showHelper,
}: {
  config?: LightConfig;
  showHelper?: boolean;
}) => {
  const values = useConfigOrDefaultRecursive(config, defaultLightConfig);

  const lightKind = values.kind || DEFAULT_LIGHT_KIND;

  if (lightKind === LightKind.directional)
    return (
      <DirectionalLightWrapper
        values={values as DirectionalLightConfig}
        showHelper={showHelper}
      />
    );

  if (lightKind === LightKind.spot)
    return (
      <SpotLightWrapper
        values={values as SpotLightConfig}
        showHelper={showHelper}
      />
    );

  if (lightKind === LightKind.point)
    return (
      <PointLightWrapper
        values={values as PointLightConfig}
        showHelper={showHelper}
      />
    );

  return null;
};

export default Light;
