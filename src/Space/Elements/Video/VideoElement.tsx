import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useThree } from "@react-three/fiber";
import { Object3D, Raycaster, Texture } from "three";
import * as themeDefaults from "defaultConfigs/theme";
import {
  Concrete,
  useConfigOrDefaultRecursive,
  useConfigOrThemeDefault,
} from "hooks/spaceHooks";
import { VideoConfig, ElementType, FileLocation, Transform } from "spaceTypes";
import PlayObject from "./PlayObject";
import PlaySurfaces from "../PlaySurfaces";
import VideoHtmlElement from "./VideoHtmlElement";
import AudioSoundAdjuster from "./AudioSoundAdjuster";
import VideoThumbnail from "./VideoThumbnail";
import ModelInteraction from "../Model/interactable";
import { InteractableContext, useInteractable } from "hooks/useInteractable";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { calculateElementShape } from "hooks/useElementDimensions";
import { HasWidthHeight } from "spaceTypes/image";

import { Timestamp } from "db";
import useVideoOrImageTexture from "./useVideoOrImageTexture";
import isEqual from "lodash/isEqual";
import ManualPlayButton from "./ManualPlayButton";
import { isIOS, isIPad } from "libs/deviceDetect";
import { tryPlayWithBackoffRetry } from "Space/Peers/useStreamPlayer";
import { useContext } from "react";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import {
  PositionalAudioConfig,
  VideoPlaySettings,
  VideoSettings,
} from "spaceTypes/video";
import { baseDefaultVideoConfig } from "defaultConfigs/useDefaultNewElements";
import {
  DEFAULT_MAX_VIDEO_PLAY_DISTANCE,
  DEFAULT_VIDEO_WIDTH,
} from "defaultConfigs";
import { Optional } from "types";
import PositionalAudioHelper from "../Audio/PositionalAudioHelper";
import { usePlayVideo } from "./usePlay";
import VideoPlaySettingsHelper from "./VideoPlaySettingsHelper";
// const PIXEL_TO_SIZE_SCALE = 0.01;

type VideoPlayerProps = {
  values: VideoConfig;
  lastActive?: Timestamp;
  handleLoaded?: (loaded: boolean) => void;
  muted?: boolean;
  playObject?: Object3D;
  inFlexBox?: boolean;
  settings: Concrete<VideoSettings>;
  visible?: boolean;
};

export const useMediaElementAndPlay = ({
  media,
}: {
  media: Optional<HTMLMediaElement>;
}) => {
  const cannotPlayUnMutedWithoutManual = useMemo(() => {
    return isIOS() || isIPad();
  }, []);
  const [failedToPlay, setFailedToPlay] = useState(false);

  const playOrPauseMedia = useCallback(
    async (play: boolean) => {
      if (!media) return;
      if (play) {
        if (!media.paused) return;
        try {
          console.log("playing video");
          await media.play();
          setFailedToPlay(false);
          return;
        } catch (e) {
          console.log("failed to play video...retrying");
          try {
            await media.play();
            console.log("succeeded to play video after retry");
            setFailedToPlay(false);
          } catch (e) {
            console.error("failed to play after retry");
            setFailedToPlay(true);
            console.error(e);
          }
        }
        if (cannotPlayUnMutedWithoutManual) return;
        try {
          await tryPlayWithBackoffRetry(media, 2, 300).toPromise();
          if (!media.paused) {
            setFailedToPlay(false);
          }
        } catch (e) {
          console.error("failed to try to replay");
          console.error(e);
        }
      } else {
        if (media.paused) return;
        console.log("pausing video");
        media.pause();
      }
    },
    [setFailedToPlay, media, cannotPlayUnMutedWithoutManual]
  );

  return {
    playOrPauseMedia,
    failedToPlay,
    cannotPlayUnMutedWithoutManual,
  };
};

const VideoPlayerInner = ({
  values,
  lastActive,
  handleLoaded,
  muted,
  playObject: playObjectFromProps,
  inFlexBox,
  settings,
  visible = true,
}: VideoPlayerProps) => {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [thumbnailImage, setThumnailImage] = useState<Texture>();

  const spaceContext = useContext(SpaceContext);

  const modalOpen = useCurrentValueFromObservable(
    spaceContext?.modalOpen$,
    false
  );
  const { camera } = useThree();

  const [generatedPlayObject, setGeneratedPlayObject] = useState<
    Optional<Object3D>
  >();

  const playObject = playObjectFromProps || generatedPlayObject;

  const { playSettings, videoThumbnail } = settings;

  const [raycaster] = useState(new Raycaster());

  useEffect(() => {
    if (playSettings.maxDistance) raycaster.far = playSettings.maxDistance;
  }, [raycaster, playSettings.maxDistance]);

  const viewDirectionIntersectsPlayGeometry = useCallback(() => {
    if (!playObject) return false;
    raycaster.setFromCamera(
      {
        x: 0,
        y: 0,
      },
      camera
    );
    const intersections = raycaster.intersectObject(playObject, true);

    if (intersections.length === 0) {
      return false;
    } else {
      return true;
    }
  }, [camera, playObject, raycaster]);

  // const [videoSize, setVideoSize] = useState<HasWidthHeight>();
  // const [thumbnailSize, setThumbnailSize] = useState<HasWidthHeight>();

  const {
    setMediaDuration: setVideoDuration,
    shouldPlay,
    seekTime,
  } = usePlayVideo({
    viewDirectionIntersectsPlayGeometry,
    initialized$: spaceContext?.initialized$,
    playSettings,
    serverTimeOffset$: spaceContext?.serverTimeOffset$,
    playStartTime: lastActive,
    disabled: !visible,
  });

  const [videoHasStartedPlaying, setVideoHasStartedPlaying] = useState<boolean>(
    false
  );

  const [shouldHavePlayedAtOnePoint, setShouldHavePlayedAtOnePoint] = useState(
    false
  );

  useEffect(() => {
    if (shouldPlay) setShouldHavePlayedAtOnePoint(true);
  }, [shouldPlay]);
  const [size, setSize] = useState<HasWidthHeight>();

  const [loadedStatus, setLoadedStatus] = useState<
    "loading" | "loaded" | "failed"
  >("loading");

  const handleAspectRatioDetermined = useCallback(
    ({
      aspectRatio,
      duration,
    }: {
      aspectRatio?: number;
      duration?: number;
    }) => {
      if (!aspectRatio) {
        // setVideoSize(undefined);
        setVideoDuration(undefined);
        // handleLoaded && handleLoaded(false);
        setLoadedStatus("failed");
      } else {
        const result = calculateElementShape(
          aspectRatio,
          values.width,
          DEFAULT_VIDEO_WIDTH
        );
        if (result) {
          setSize({ width: result.width, height: result.height });
        }
        setVideoDuration(duration);
        handleLoaded && handleLoaded(true);
        setLoadedStatus("loaded");
      }
    },
    [setVideoDuration, values.width, handleLoaded]
  );

  const handleVideoDataLoaded = useCallback(
    (e: SyntheticEvent<HTMLVideoElement>) => {
      const videoElement = e.target as HTMLVideoElement;
      const { videoWidth, videoHeight } = videoElement;

      if (!videoWidth || !videoHeight) return;

      videoElement.width = videoWidth;
      videoElement.height = videoHeight;

      handleAspectRatioDetermined({
        aspectRatio: videoWidth / videoHeight,
        duration: videoElement.duration,
      });

      // if (computedStartTime) videoElement.currentTime = computedStartTime;
    },
    [handleAspectRatioDetermined]
  );

  const handleVideoStartedPlaying = useCallback(() => {
    setVideoHasStartedPlaying(true);
  }, []);

  const {
    playOrPauseMedia,
    failedToPlay,
    cannotPlayUnMutedWithoutManual,
  } = useMediaElementAndPlay({ media: video });

  const setImageSizeFromDimensions = useCallback(
    ({ aspectRatio }: { aspectRatio?: number }) => {
      if (aspectRatio) {
        const result = calculateElementShape(
          aspectRatio,
          values.width,
          DEFAULT_VIDEO_WIDTH
        );
        if (result) setSize({ width: result.width, height: result.height });
        setLoadedStatus("loaded");
      }
    },
    [values.width]
  );

  const { showThumbnail, play } = useMemo(() => {
    const play = shouldPlay && !modalOpen;
    const showThumbnail = !play || !videoHasStartedPlaying || failedToPlay;

    return {
      showThumbnail,
      play,
    };
  }, [modalOpen, shouldPlay, failedToPlay, videoHasStartedPlaying]);

  const [groupRef, setGroupRef] = useState<Optional<THREE.Object3D>>();

  const texture = useVideoOrImageTexture({
    imageTexture: thumbnailImage,
    videoElement: video,
    useImage: showThumbnail,
    transparent: true,
  });

  const listener = useCurrentValueFromObservable(spaceContext?.listener$, null);
  const frame = useConfigOrThemeDefault(
    values?.frame,
    themeDefaults.defaultFrame
  );

  if (!spaceContext) return null;

  return (
    <group ref={setGroupRef}>
      {shouldHavePlayedAtOnePoint && (
        <VideoHtmlElement
          videoConfig={values}
          play={play}
          playOrPauseMedia={playOrPauseMedia}
          handleVideoEvent={handleVideoDataLoaded}
          handleVideoStartedPlaying={handleVideoStartedPlaying}
          mediaRef={setVideo}
          seekTime={seekTime}
          media={video}
          muted={muted}
        />
      )}
      {failedToPlay && play && cannotPlayUnMutedWithoutManual && (
        <ManualPlayButton
          playOrPauseVideo={playOrPauseMedia}
          legacyRotation={values.legacyRotation}
        />
      )}
      <VideoThumbnail
        config={values}
        imageRef={setThumnailImage}
        metadataDetermined={setImageSizeFromDimensions}
        visible={visible}
        settings={videoThumbnail}
      />
      <PlaySurfaces
        planeDimensions={size}
        {...frame}
        legacyRotation={values.legacyRotation}
        handleLoaded={handleLoaded}
        texture={texture}
        serverTimeOffset$={spaceContext?.serverTimeOffset$}
        inFlexBox={inFlexBox}
        loading={loadedStatus === "loading"}
        mediaGeometryCurve={settings.geometry.mediaGeometryCurve}
        mediaGeometryType={settings.geometry.mediaGeometryType}
        mediaGeometryModel={settings.geometry.mediaGeometryModel}
        mediaPlaySurfaces={settings.geometry.mediaPlaySurfaces}
      />
      {listener && video && groupRef && !muted && (
        <AudioSoundAdjuster
          listener={listener}
          play={play && videoHasStartedPlaying}
          soundConfig={settings.positionalAudio}
          mediaElement={video}
          // setAudioPlaying={setAudioPlaying}
          spatialAudioEnabled={spaceContext?.spatialAudioEnabled}
          parentElement={groupRef}
        />
      )}
      {!playSettings.auto && !playObjectFromProps && (
        <PlayObject setPlayMesh={setGeneratedPlayObject} elementSize={size} />
      )}
    </group>
  );
};

interface VideoKey {
  videoType: "stored video" | "stream";
  file: Optional<FileLocation>;
  playbackId?: string;
}

const toVideoKey = (
  videoConfig: Pick<VideoConfig, "type" | "storedVideo" | "liveStream">
): VideoKey => ({
  videoType: videoConfig.type,
  file: videoConfig.storedVideo,
  playbackId: videoConfig.liveStream?.muxPlaybackId,
});

export const useRefreshVideoIfSourceChanged = (
  values: Pick<
    VideoConfig,
    "type" | "storedVideo" | "liveStream" | "storedVideos"
  >
) => {
  const [videoKey, setVideoKey] = useState<VideoKey>(() => toVideoKey(values));

  const [hideVideo, setHideVideo] = useState(false);

  useEffect(() => {
    const newVideoKey = toVideoKey({
      type: values.type,
      storedVideo: values.storedVideo,
      liveStream: values.liveStream,
    });

    if (!isEqual(videoKey, newVideoKey)) {
      setVideoKey(newVideoKey);
      setHideVideo(true);

      setTimeout(() => {
        setHideVideo(false);
      }, 10);
    }
  }, [
    videoKey,
    values.storedVideos,
    values.liveStream,
    values.type,
    values.storedVideo,
  ]);

  return hideVideo;
};

export const VideoPlayer = (props: VideoPlayerProps) => {
  const hideVideo = useRefreshVideoIfSourceChanged(props.values);

  if (hideVideo) return null;

  return <VideoPlayerInner {...props} />;
};

export const VideoHelper = ({
  positionalAudioConfig,
  elementTransform,
  playSettings,
}: {
  playSettings: VideoPlaySettings | undefined;
  positionalAudioConfig: PositionalAudioConfig | undefined;
  elementTransform: Transform | undefined;
}) => {
  return (
    <>
      {playSettings && (
        <VideoPlaySettingsHelper
          playSettings={playSettings}
          elementTransform={elementTransform}
        />
      )}
      {positionalAudioConfig && (
        <>
          <PositionalAudioHelper
            audio={null}
            elementTransform={elementTransform}
            positionalAudioConfig={positionalAudioConfig}
            maxPlayDistance={
              !playSettings?.auto
                ? playSettings?.maxDistance || DEFAULT_MAX_VIDEO_PLAY_DISTANCE
                : undefined
            }
          />
        </>
      )}
    </>
  );
};

const VideoElement = ({
  config,
  elementId,
  lastActive,
  muted = false,
  visible = true,
  showHelper,
  elementTransform,
  ...rest
}: {
  elementId: string;
  config?: VideoConfig;
  lastActive?: Timestamp;
  handleLoaded?: (loaded: boolean) => void;
  visible?: boolean;
  muted?: boolean;
  showHelper?: boolean | undefined;
  elementTransform: Transform | undefined;
}) => {
  const values = useConfigOrDefaultRecursive(config, baseDefaultVideoConfig);

  const settings = useConfigOrThemeDefault(
    config?.settings,
    themeDefaults.videoSettings
  );

  const frame = useConfigOrThemeDefault(
    config?.frame,
    themeDefaults.defaultFrame
  );

  const zOffset = values.offsetFromBack ? frame.frameConfig.depth || 0 : 0;

  const interactableContext = useInteractable(elementId, values);

  return (
    <>
      <InteractableContext.Provider value={interactableContext}>
        <group position-z={zOffset} visible={visible}>
          <VideoPlayer
            {...rest}
            values={values}
            lastActive={lastActive}
            muted={muted}
            settings={settings}
            visible={visible}
          />
        </group>
        {!interactableContext?.disableInteractivity &&
          values.interactable &&
          values.interactableConfig && (
            <ModelInteraction
              elementType={ElementType.video}
              elementFile={
                values.storedVideo ||
                values.storedVideos?.mp4 ||
                values.storedVideos?.webm
              }
              interactionConfig={values.interactableConfig!}
            />
          )}
      </InteractableContext.Provider>
      <VideoHelper
        elementTransform={elementTransform}
        positionalAudioConfig={values.settings?.positionalAudio}
        playSettings={values.settings?.playSettings}
      />
    </>
  );
};

export default VideoElement;
