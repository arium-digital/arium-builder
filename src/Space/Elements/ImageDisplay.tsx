import React, {
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { ElementType, ImageConfig } from "spaceTypes";
import { DoubleSide, FrontSide, TextureLoader } from "three";
import { getFileDownloadUrl, isStoredFile } from "fileUtils";
import { useLoader } from "@react-three/fiber";
import ModelInteraction from "./Model/interactable";
import { useElementDimensions } from "hooks/useElementDimensions";
import AnimatedImageLoader from "./lib/AnimatedImageLoader";
import { getImageResizeUrl } from "media/mediaUrls";
import {
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_IN_SPACE_IMAGE_QUALITY,
  DEFAULT_IN_SPACE_IMAGE_RESOLUTION,
  placeholderImageUrl,
} from "defaultConfigs";
import * as themeDefaults from "defaultConfigs/theme";
import InteractableTextureDisplay from "./InteractableTextureDisplay";
import { ErrorBoundary } from "react-error-boundary";
import { InteractableContext, useInteractable } from "hooks/useInteractable";
import { GeometricPlaySurfaceWrapper } from "./PlaySurfaces";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import { Concrete, useConfigOrThemeDefault } from "hooks/spaceHooks";
import {
  MediaDisplayConfig,
  HasInSpaceQualityConfig,
} from "spaceTypes/mediaDisplay";
import { ImageSettings } from "spaceTypes/image";
import { HasFrameConfig } from "spaceTypes/text";
import { Optional } from "types";

type ImageDisplayMeshBaseProps = {
  handleLoaded?: (
    loaded: boolean,
    dimensions?: { width: number; height: number }
  ) => void;
};

type ImageConfigWithOutDisplay = Omit<
  ImageConfig,
  | "mediaGeometryType"
  | "mediaGeometryModel"
  | "inSpaceResolution"
  | "inSpaceQuality"
>;

const ImageDisplayMeshInner = ({
  imagePath,
  config,
  settings,
  frame,
  handleLoaded,
}: ImageDisplayMeshBaseProps & {
  imagePath: string;
  settings: Concrete<ImageSettings>;
  frame: Concrete<HasFrameConfig>;
  config: ImageConfigWithOutDisplay;
}) => {
  const loaderToUse = useMemo(
    () => (config.isAnimated ? AnimatedImageLoader : TextureLoader),
    [config.isAnimated]
  );
  const texture = useLoader(loaderToUse, imagePath);

  const [aspect, setAspect] = useState<number>();

  useEffect(() => {
    if (texture) {
      const { height, width } = texture.image as
        | HTMLImageElement
        | HTMLCanvasElement;
      setAspect(width / height);

      handleLoaded && handleLoaded(true, { width, height });
    } else {
      handleLoaded && handleLoaded(false);
    }
  }, [texture, handleLoaded]);

  const imageDimensions = useElementDimensions(
    aspect,
    config.width,
    DEFAULT_IMAGE_WIDTH
  );

  const planeDimensions = useMemo(
    () =>
      imageDimensions
        ? ([imageDimensions.width, imageDimensions.height] as [number, number])
        : null,
    [imageDimensions]
  );

  const side = useMemo(() => (frame.hasFrame ? FrontSide : DoubleSide), [
    frame.hasFrame,
  ]);

  const spaceContext = useContext(SpaceContext);

  const geometry = settings.geometry;

  const showPlane =
    geometry.mediaGeometryType === "plane" ||
    geometry.mediaGeometryType === "curved" ||
    !geometry.mediaGeometryModel;
  const showModel =
    geometry.mediaGeometryType === "3d geometry" &&
    !!geometry.mediaGeometryModel;

  if (showPlane)
    return (
      <>
        <group rotation-y={config.legacyRotation ? Math.PI : 0}>
          <InteractableTextureDisplay
            planeDimensions={{
              width: planeDimensions?.[0],
              height: planeDimensions?.[1],
            }}
            texture={texture}
            side={side}
            frameConfig={frame.frameConfig}
            hasFrame={frame.hasFrame}
            transparent={config.transparent}
            curve={geometry.mediaGeometryCurve?.curveAngle}
            curveOrientation={geometry.mediaGeometryCurve?.orientation}
            curved={geometry.mediaGeometryType === "curved"}
          />
        </group>
      </>
    );

  if (showModel)
    return (
      <GeometricPlaySurfaceWrapper
        // @ts-ignore
        model={geometry.mediaGeometryModel}
        texture={texture}
        serverTimeOffset$={spaceContext?.serverTimeOffset$}
      />
    );
  // serverTimeOffset$={serverTimeOffset$}

  // groupRef={mesh}

  return null;
};

const useImagePath = (
  config: ImageConfig,
  display?: HasInSpaceQualityConfig
) => {
  const [imagePath, setImagePath] = useState<{
    path: Optional<string>;
    loaded: boolean;
  }>({
    path: null,
    loaded: false,
  });

  useEffect(() => {
    (async () => {
      if (config.imageFile) {
        if (config.isAnimated) {
          setImagePath({
            path: await getFileDownloadUrl(config.imageFile),
            loaded: true,
          });
        } else {
          if (isStoredFile(config.imageFile)) {
            const imageResizeUrl = getImageResizeUrl(config.imageFile, {
              maxWidth:
                display?.inSpaceResolution || DEFAULT_IN_SPACE_IMAGE_RESOLUTION,
              quality:
                display?.inSpaceQuality || DEFAULT_IN_SPACE_IMAGE_QUALITY,
            });
            setImagePath({
              path: imageResizeUrl,
              loaded: true,
            });
          } else {
            setImagePath({
              path: config.imageFile.url,
              loaded: true,
            });
          }
        }
      } else {
        setImagePath({
          path: placeholderImageUrl("Image"),
          loaded: true,
        });
      }
    })();
  }, [
    display?.inSpaceQuality,
    display?.inSpaceResolution,
    config.imageFile,
    config.isAnimated,
  ]);

  return imagePath;
};

const FailedToLoadImageMesh = ({
  config,
  displayConfig,
  handleLoaded,
}: ImageDisplayMeshBaseProps & {
  config: ImageConfigWithOutDisplay;
  displayConfig: MediaDisplayConfig;
}) => {
  const planeDimensions = useMemo(() => [1, 1] as [number, number], []);

  useLayoutEffect(() => {
    if (handleLoaded) handleLoaded(true);
  }, [handleLoaded]);

  return (
    <group rotation-y={config.legacyRotation ? Math.PI : 0}>
      <InteractableTextureDisplay
        planeDimensions={{
          width: planeDimensions?.[0],
          height: planeDimensions?.[1],
        }}
        texture={undefined}
        side={FrontSide}
        frameConfig={config.frame?.frameConfig}
        hasFrame={config.frame?.hasFrame}
        transparent={config.transparent}
        curved={false}
      />
    </group>
  );
};

export const ImageDisplayMesh = (
  props: ImageDisplayMeshBaseProps & {
    config: ImageConfig;
    settings: Concrete<ImageSettings>;
    frame: Concrete<HasFrameConfig>;
  }
) => {
  const { config, settings: displayConfig } = props;
  const { path: imagePath, loaded: pathLoaded } = useImagePath(
    config,
    displayConfig
  );

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(true);

    setTimeout(() => {
      setRefresh(false);
    }, 100);
  }, [
    displayConfig.geometry.mediaGeometryModel,
    displayConfig.geometry.mediaGeometryType,
  ]);

  const { handleLoaded } = props;

  useEffect(() => {
    if (!imagePath && pathLoaded && handleLoaded) handleLoaded(true);
  }, [imagePath, pathLoaded, handleLoaded]);

  if (!imagePath || refresh) return null;

  return (
    <ErrorBoundary
      fallback={
        <FailedToLoadImageMesh {...props} displayConfig={displayConfig} />
      }
    >
      <Suspense fallback={null}>
        <ImageDisplayMeshInner
          {...props}
          settings={displayConfig}
          imagePath={imagePath}
          frame={props.frame}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

const ImageElement = ({
  elementId,
  config,
  ...rest
}: {
  elementId: string;
  config: ImageConfig;
  handleLoaded?: (
    loaded: boolean,
    dimensions?: { width: number; height: number }
  ) => void;
}) => {
  const interactableContext = useInteractable(elementId, config);

  const settings = useConfigOrThemeDefault(
    config.settings,
    themeDefaults.getDefaultImageSettings
  );

  const frame = useConfigOrThemeDefault(
    config.frame,
    themeDefaults.defaultFrame
  );

  const zOffset = config.offsetFromBack
    ? (frame?.hasFrame && frame?.frameConfig?.depth) || 0
    : 0;

  return (
    <InteractableContext.Provider value={interactableContext}>
      <group position-z={zOffset}>
        <ImageDisplayMesh
          {...rest}
          settings={settings}
          config={config}
          frame={frame}
        />
      </group>
      {!interactableContext?.disableInteractivity &&
        config.interactable &&
        config.interactableConfig && (
          <ModelInteraction
            elementType={ElementType.image}
            elementFile={config.imageFile}
            interactionConfig={config.interactableConfig!}
          />
        )}
    </InteractableContext.Provider>
  );
};

export default ImageElement;
