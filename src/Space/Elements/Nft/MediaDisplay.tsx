import { useCallback, useLayoutEffect, useMemo } from "react";
import {
  FileLocation,
  ImageConfig,
  ModelConfig,
  Transform,
  VideoConfig,
} from "spaceTypes";
import { MediaType } from "./lib";
import { ImageDisplayMesh } from "Space/Elements/ImageDisplay";
import { VideoHelper, VideoPlayer } from "Space/Elements/Video/VideoElement";
import { useReflow } from "@react-three/flex";
import { useFileDownloadUrl } from "fileUtils";
import { ModelWrapper } from "../Model";
import { useConfigOrThemeDefault } from "hooks/spaceHooks";
import { VideoSettings } from "spaceTypes/video";
import { ImageSettings } from "spaceTypes/image";
import { HasFrameConfig } from "spaceTypes/text";
import * as themeDefaults from "defaultConfigs/theme";

type CommonProps = {
  video: VideoSettings | undefined;
  image: ImageSettings | undefined;
  frame: HasFrameConfig | undefined;
  handleLoaded?: (loaded: boolean) => void;
  muted?: boolean;
  showHelper: boolean | undefined;
  elementTransform: Transform | undefined;
};

const ImageMediaDisplay = ({
  fileLocation,
  handleLoaded,
  ...rest
}: { fileLocation: FileLocation } & CommonProps) => {
  const displayConfig = useConfigOrThemeDefault(
    rest.image,
    themeDefaults.getDefaultImageSettings
  );
  const frameConfig = useConfigOrThemeDefault(
    rest.frame,
    themeDefaults.defaultFrame
  );

  const config: ImageConfig = useMemo(
    () => ({
      imageFile: fileLocation,
      interactable: true,
      settings: displayConfig,
      frame: frameConfig,
      // mediaGeometryModel: rest.displayConfig.mediaGeometryModel || undefined,
      // mediaGeometryCurve: rest.displayConfig.mediaGeometryCurve || undefined,
    }),
    [displayConfig, fileLocation, frameConfig]
  );

  const reflow = useReflow();
  const handleMediaLoaded = useCallback(
    (loaded: boolean) => {
      if (handleLoaded) handleLoaded(loaded);
      reflow();
    },
    [reflow, handleLoaded]
  );

  return (
    <ImageDisplayMesh
      config={config}
      {...rest}
      settings={displayConfig}
      frame={frameConfig}
      handleLoaded={handleMediaLoaded}
    />
  );
};

const VideoMediaDisplay = ({
  fileLocation,
  handleLoaded,
  showHelper,
  elementTransform,
  ...rest
}: { fileLocation: FileLocation } & CommonProps) => {
  const videoSettings = useConfigOrThemeDefault(
    rest.video,
    themeDefaults.videoSettings
  );

  const config: VideoConfig = useMemo(() => {
    return {
      storedVideo: fileLocation,
      type: "stored video",
      interactable: true,
    };
  }, [fileLocation]);

  const reflow = useReflow();
  const handleMediaLoaded = useCallback(
    (loaded: boolean) => {
      if (handleLoaded) handleLoaded(loaded);
      reflow();
    },
    [reflow, handleLoaded]
  );

  return (
    <>
      <VideoPlayer
        values={config}
        {...rest}
        handleLoaded={handleMediaLoaded}
        inFlexBox
        settings={videoSettings}
      />
      {showHelper && (
        <VideoHelper
          elementTransform={elementTransform}
          positionalAudioConfig={videoSettings.positionalAudio}
          playSettings={videoSettings.playSettings}
        />
      )}
    </>
  );
};

const ModelMediaDisplay = ({
  fileLocation,
  handleLoaded,
}: { fileLocation: FileLocation } & CommonProps) => {
  const modelUrl = useFileDownloadUrl(fileLocation);
  const config: ModelConfig = useMemo(() => {
    return {
      modelFile: fileLocation,
      bundledMaterial: true,
      materialConfig: undefined,
      animated: true,
    };
  }, [fileLocation]);

  const reflow = useReflow();
  const handleMediaLoaded = useCallback(
    (loaded: boolean) => {
      if (handleLoaded) handleLoaded(loaded);
      reflow();
    },
    [reflow, handleLoaded]
  );

  if (!modelUrl) return null;

  return (
    <ModelWrapper
      config={config}
      handleLoaded={handleMediaLoaded}
      modelUrl={modelUrl}
    />
  );
};

const MediaDisplay = ({
  fileLocation,
  mediaType,
  ...rest
}: {
  fileLocation: FileLocation | undefined;
  mediaType: MediaType | undefined;
  // media: Media | undefined;
  // mediaType: MediaType | undefined;
} & CommonProps) => {
  const reflow = useReflow();

  useLayoutEffect(() => {
    reflow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileLocation, mediaType]);

  if (!mediaType || !fileLocation) return null;

  if (mediaType === "image")
    return <ImageMediaDisplay fileLocation={fileLocation} {...rest} />;

  if (mediaType === "video" || mediaType === "gif")
    return <VideoMediaDisplay fileLocation={fileLocation} {...rest} />;

  if (mediaType === "model")
    return <ModelMediaDisplay fileLocation={fileLocation} {...rest} />;

  return null;
};

export default MediaDisplay;
