import React, {
  memo,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { Mesh, BufferGeometry, Texture, Material } from "three";
import { toVector3 } from "libs/utils";
import { ModelConfig, PlaySurfaceConfig, PlaySurfacesConfig } from "spaceTypes";
import * as THREE from "three";
import { FrameConfiguration } from "spaceTypes/image";
import Frame from "../Frame";
import { Concrete, useConfigOrDefault } from "hooks/spaceHooks";
import {
  defaultPlaySurfacesConfig,
  defaultSurfaceConfig,
  DEFAULT_CURVE_ANGLE,
  DEFAULT_CURVE_ORIENTATION,
  DEFAULT_PLAY_SURFACES_TYPE,
  DEFAULT_VIDEO_PLAY_SURFACE_SIDE,
} from "defaultConfigs";
import { useGlobalPointerOverLayer } from "hooks/useLayers";
import { HoverMeshFrame } from "../HoverMesh";
import { useFileDownloadUrl } from "fileUtils";
import { ModelWrapper } from "../Model";
import { Observable } from "rxjs";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { Box } from "@react-three/flex";
import InteractableTextureDisplay from "../InteractableTextureDisplay";
import { InteractableContext } from "hooks/useInteractable";
import { Orientation } from "spaceTypes/video";
import { MediaGeometryConfig } from "spaceTypes/mediaDisplay";
import { HasFrameConfig } from "spaceTypes/text";
import { Optional } from "types";
import { useLegacyRotation } from "../Video/videoUtils";
import { boxProps } from "../Nft/types";

export const planeFromCrop = ({
  cropLeft,
  cropRight,
  cropTop,
  cropBottom,
  videoWidth,
  videoHeight,
}: {
  cropLeft: number;
  cropRight: number;
  cropTop: number;
  cropBottom: number;
  videoWidth: number;
  videoHeight: number;
}): [number, number] => {
  const [cropWidth, cropHeight] = [cropRight - cropLeft, cropBottom - cropTop];

  return [videoWidth * cropWidth, videoHeight * cropHeight];
};

type BasePlaySurfaceProps = {
  texture: Texture | undefined;
  planeDimensions?: { width: number | undefined; height: number | undefined };
  frameConfig?: FrameConfiguration;
  hasFrame?: boolean;
  setMesh?: (mesh: Optional<Mesh>) => void;
  legacyRotation: boolean | undefined;
  handleLoaded?: (loaded: boolean) => void;
};

export const PlaySurface = ({
  texture,
  config,
  planeDimensions,
  frameConfig,
  setMesh,
  legacyRotation,
  handleLoaded,
}: BasePlaySurfaceProps & {
  config: PlaySurfaceConfig | undefined;
}) => {
  const values = useConfigOrDefault(config, defaultSurfaceConfig);
  const { cropTop = 0, cropBottom = 1, cropLeft = 0, cropRight = 1 } = values;

  const videoWidth = planeDimensions?.width || 0;
  const videoHeight = planeDimensions?.height || 0;

  const geometryShape = useMemo(
    () =>
      planeFromCrop({
        cropBottom,
        cropTop,
        cropLeft,
        cropRight,
        videoWidth,
        videoHeight,
      }),
    [cropBottom, cropTop, cropLeft, cropRight, videoWidth, videoHeight]
  );

  const imageShape: [number, number] = useMemo(
    () => [geometryShape[0], geometryShape[1]],
    [geometryShape]
  );

  const rotation = useLegacyRotation(legacyRotation);

  const interactableContext = useContext(InteractableContext);

  const setMeshForDynamicLayer = useGlobalPointerOverLayer(
    interactableContext?.enablePointerOverLayer$
  );

  const pointerOver = useCurrentValueFromObservable(
    interactableContext?.pointerOver$,
    false
  );

  const aggregateSetMesh = useCallback(
    (mesh: Mesh | null) => {
      setMeshForDynamicLayer(mesh);
      setMesh && setMesh(mesh);
    },
    [setMesh, setMeshForDynamicLayer]
  );
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);

  useEffect(() => {
    if (!geometry) return;
    if (values.isEquirectangular) return;
    const uvs = geometry.getAttribute("uv");

    // bottom left
    uvs.setXY(0, cropLeft, cropBottom);
    // bottom right
    uvs.setXY(1, cropRight, cropBottom);
    // top left
    uvs.setXY(2, cropLeft, cropTop);
    // top right
    uvs.setXY(3, cropRight, cropTop);
    geometry.attributes.uv.needsUpdate = true;
  }, [
    geometry,
    cropBottom,
    cropTop,
    cropLeft,
    cropRight,
    values.isEquirectangular,
  ]);

  const side = useMemo(() => values.side || DEFAULT_VIDEO_PLAY_SURFACE_SIDE, [
    values.side,
  ]);

  useLayoutEffect(() => {
    if (handleLoaded) handleLoaded(true);
  }, [handleLoaded]);

  return (
    <>
      <group
        position={toVector3(values.position)}
        rotation={toVector3(values.rotation)}
      >
        <Box {...boxProps}>
          <group rotation-y={rotation}>
            <mesh ref={aggregateSetMesh}>
              {values.isEquirectangular ? (
                <sphereBufferGeometry
                  args={[geometryShape[0], 24, 24]}
                  ref={setGeometry}
                />
              ) : (
                <planeBufferGeometry args={geometryShape} ref={setGeometry} />
              )}
              <meshBasicMaterial
                map={texture}
                opacity={values.transparent ? values.opacity : undefined}
                transparent={values.transparent}
                side={
                  side === "Double Sided" ? THREE.DoubleSide : THREE.FrontSide
                }
              />
            </mesh>
            {frameConfig && (
              <group>
                <Frame config={frameConfig} imageDimensions={imageShape} />
              </group>
            )}
          </group>
        </Box>
        {imageShape && (
          <group visible={pointerOver} rotation-y={rotation}>
            <HoverMeshFrame
              elementWidth={imageShape[0]}
              elementHeight={imageShape[1]}
              frameConfig={frameConfig ? frameConfig : undefined}
            />
          </group>
        )}
      </group>
    </>
  );
};

const SinglePlanePlaySurface = (
  props: BasePlaySurfaceProps & {
    loading?: boolean;
    curve?: number;
    curveOrientation?: Orientation;
    curved: boolean;
  }
) => {
  return (
    <InteractableTextureDisplay
      planeDimensions={props.planeDimensions}
      texture={props.texture}
      side={THREE.FrontSide}
      transparent={false}
      frameConfig={props.frameConfig}
      hasFrame={props.hasFrame}
      loading={props.loading}
      handleLoaded={props.handleLoaded}
      curve={props.curve}
      curveOrientation={props.curveOrientation}
      curved={props.curved}
      legacyRotation={props.legacyRotation}
    />
  );
};

const PlanePlaySurfaces = ({
  playSurfaces,
  planeDimensions,
  ...rest
}: BasePlaySurfacesProps & {
  playSurfaces: Optional<PlaySurfacesConfig>;
}) => {
  const values = useConfigOrDefault(playSurfaces, defaultPlaySurfacesConfig);

  if (!planeDimensions?.width || !planeDimensions?.height) return null;

  return (
    <>
      {Object.entries(values)
        .filter(([, config]) => {
          return config !== null;
        })
        .map(([id, config]) => (
          <PlaySurface
            key={id}
            {...rest}
            config={config || undefined}
            // @ts-ignore
            planeDimensions={planeDimensions}
          />
        ))}
    </>
  );
};

export const GeometricPlaySurfaceWrapper = ({
  model,
  serverTimeOffset$,
  texture,
  handleLoaded,
}: Pick<BasePlaySurfacesProps, "texture" | "handleLoaded"> & {
  model: Optional<ModelConfig>;
  serverTimeOffset$?: Observable<number>;
}) => {
  const modelUrl = useFileDownloadUrl(model?.modelFile);
  const [material, setMaterial] = useState<Optional<Material>>();

  useEffect(() => {
    if (!texture) return;

    const beforeFlipY = texture.flipY;

    // flip y to make sure video is correct orientation.
    // https://discourse.threejs.org/t/model-texture-reversed-flip/12900
    texture.flipY = false;
    texture.needsUpdate = true;

    return () => {
      texture.flipY = beforeFlipY;
      texture.needsUpdate = true;
    };
  }, [texture]);

  return (
    <>
      <meshBasicMaterial map={texture} ref={setMaterial} />
      {modelUrl && model && (
        <Suspense fallback={null}>
          <ModelWrapper
            modelUrl={modelUrl}
            config={model}
            overrideMaterial={material}
            handleLoaded={handleLoaded}
          />
        </Suspense>
      )}
    </>
  );
};

type BasePlaySurfacesProps = {
  texture: Texture | undefined;
  planeDimensions:
    | { width: number | undefined; height: number | undefined }
    | undefined;
  frameConfig: FrameConfiguration;
  hasFrame: boolean;
  legacyRotation: boolean | undefined;
  serverTimeOffset$: Observable<number>;
  loading?: boolean;
  handleLoaded?: (loaded: boolean) => void;
} & Concrete<HasFrameConfig>;

type PlaySurfacesProps = BasePlaySurfacesProps & MediaGeometryConfig;

const PlaySurfaces = ({
  mediaGeometryType = DEFAULT_PLAY_SURFACES_TYPE,
  mediaPlaySurfaces,
  mediaGeometryModel,
  mediaGeometryCurve,
  loading,
  ...rest
}: PlaySurfacesProps) => {
  if (mediaGeometryType === "plane") {
    return (
      <SinglePlanePlaySurface {...rest} loading={loading} curved={false} />
    );
  }
  if (mediaGeometryType === "curved") {
    return (
      <SinglePlanePlaySurface
        {...rest}
        loading={loading}
        curved={true}
        curve={mediaGeometryCurve?.curveAngle || DEFAULT_CURVE_ANGLE}
        curveOrientation={
          mediaGeometryCurve?.orientation || DEFAULT_CURVE_ORIENTATION
        }
      />
    );
  }
  if (mediaGeometryType === "planes") {
    return <PlanePlaySurfaces {...rest} playSurfaces={mediaPlaySurfaces} />;
  }

  return <GeometricPlaySurfaceWrapper model={mediaGeometryModel} {...rest} />;
};

const OptionallyFlexPlaySurfaces = memo(
  ({
    inFlexBox,
    ...props
  }: PlaySurfacesProps & {
    inFlexBox?: boolean;
  }) => {
    if (inFlexBox) {
      return (
        <Box {...boxProps}>
          <PlaySurfaces {...props} />
        </Box>
      );
    }

    return <PlaySurfaces {...props} />;
  }
);

export default OptionallyFlexPlaySurfaces;
