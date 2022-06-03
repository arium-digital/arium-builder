import React, {
  Suspense,
  useEffect,
  SyntheticEvent,
  useState,
  useMemo,
  memo,
} from "react";
import { FileLocation, StoredVideoConfig, VideoConfig } from "spaceTypes";
import { extractExt, useFileDownloadUrl } from "fileUtils";

import dynamic from "next/dynamic";
import { useBehaviorSubjectFromCurrentValue } from "hooks/useObservable";
import { switchMap } from "rxjs/operators";
import { combineLatest, EMPTY } from "rxjs";
import NonTransformedHtml from "components/utils/NonTransformedHtml";
import { trackIfEnabled } from "analytics/init";
// import { tryPlayWithBackoffRetry } from "components/Consumers/useStreamPlayer";

const LiveStreamVideoSource = dynamic(() => import("./LiveStreamVideoSource"));

export interface MediaMetadata {
  aspectRatio?: number;
  duration?: number;
}

export type MetadataDetermined = (mediaMetadata: MediaMetadata) => void;

export const VideoSource = ({
  file,
  fileExtension,
}: {
  file: FileLocation;
  fileExtension?: string;
}) => {
  const filePath = useFileDownloadUrl(file);
  const ext = useMemo(() => {
    if (fileExtension) return fileExtension;
    if (file.fileType === "external") return extractExt(file.url);
    if (file.fileType === "stored") return extractExt(file.fileName);
  }, [file, fileExtension]);

  if (!filePath) return null;

  // ext might be undefined
  // If undefined: https://stackoverflow.com/questions/34506704/is-the-video-source-type-tag-optional-if-it-is-should-i-put-the-src-inline-rath
  return <source src={`${filePath}`} type={ext && `video/${ext}`} />;
};

export const placeholderVideoSource =
  "https://assets.vlts.pw/public/videoPlaceholder.mp4";

const StoredVideoElement = memo(
  ({
    videoConfig,
    videoRef,
    handleVideoMetadataLoaded,
    handleVideoStartedPlaying,
    visible,
    muted = false,
  }: {
    videoConfig: StoredVideoConfig;
    videoRef: (video: HTMLVideoElement | null) => void;
    handleVideoMetadataLoaded: (e: SyntheticEvent<HTMLVideoElement>) => void;
    handleVideoStartedPlaying: () => void;
    visible?: boolean;
    muted?: boolean;
  }) => {
    const { storedVideo, storedVideos } = videoConfig;

    const storedVideoSource = useFileDownloadUrl(storedVideo);
    const legacyStoredVideoSource = useFileDownloadUrl(storedVideos?.mp4);

    const videoSource =
      storedVideoSource || legacyStoredVideoSource || placeholderVideoSource;

    useEffect(() => {
      trackIfEnabled("Viewed video", { video: videoSource });
    }, [videoSource]);

    if (!videoSource) return null;

    return (
      <video
        style={{ display: visible ? "block" : "none" }}
        crossOrigin="anonymous"
        controls
        playsInline
        loop
        // fires when first frame of video has been loaded
        onLoadedData={handleVideoMetadataLoaded}
        onPlaying={handleVideoStartedPlaying}
        ref={videoRef}
        preload="metadata"
        muted={muted}
        src={videoSource}
      ></video>
    );
  }
);

const LiveStreamVideoElement = memo(
  ({
    muxPlaybackId,
    videoRef,
    handleVideoMetadataLoaded,
    handleVideoStartedPlaying,
    visible,
    muted = false,
  }: {
    muxPlaybackId?: string;
    videoRef: (video: HTMLVideoElement | null) => void;
    handleVideoMetadataLoaded: (e: SyntheticEvent<HTMLVideoElement>) => void;
    handleVideoStartedPlaying: () => void;
    visible?: boolean;
    muted?: boolean;
  }) => {
    const [video, setVideo] = useState<HTMLVideoElement | null>(null);

    useEffect(() => {
      videoRef(video);
    }, [video, videoRef]);

    return (
      <video
        style={{ display: visible ? "block" : "none" }}
        crossOrigin="anonymous"
        controls
        playsInline
        autoPlay
        loop
        ref={setVideo}
        // fires when first frame of video has been loaded
        onLoadedData={handleVideoMetadataLoaded}
        onPlaying={handleVideoStartedPlaying}
        muted={muted}
      >
        {video && (
          <Suspense fallback={<></>}>
            <LiveStreamVideoSource
              videoElement={video}
              muxPlaybackId={muxPlaybackId}
            />
          </Suspense>
        )}
      </video>
    );
  }
);

type VideoHtmlElementProps = {
  videoConfig?: VideoConfig;
  play: boolean;
  mediaRef: (video: HTMLVideoElement | null) => void;
  media: HTMLMediaElement | null;
  seekTime: number | undefined;
  handleVideoEvent: (e: SyntheticEvent<HTMLVideoElement>) => void;
  handleVideoStartedPlaying: () => void;
  visible?: boolean;
  muted?: boolean;
  playOrPauseMedia: (play: boolean) => void;
};

export const usePlayAndSeek = (
  args: Pick<VideoHtmlElementProps, "play" | "seekTime" | "media">,
  playOrPauseVideo: (play: boolean) => void
) => {
  const { play, seekTime, media } = args;
  const play$ = useBehaviorSubjectFromCurrentValue(play);
  const seekTime$ = useBehaviorSubjectFromCurrentValue(seekTime);

  const media$ = useBehaviorSubjectFromCurrentValue(media);

  useEffect(() => {
    if (play) {
      if (!media) return;
      const triggerPlay = () => {
        playOrPauseVideo(true);
      };
      document.addEventListener("click", triggerPlay);

      return () => {
        document.removeEventListener("click", triggerPlay);
      };
    }
  }, [play, media, playOrPauseVideo]);

  useEffect(() => {
    const sub = media$
      .pipe(
        switchMap((media) => {
          if (!media) return EMPTY;

          const playAndSeekTime$ = combineLatest([play$, seekTime$]);

          return playAndSeekTime$.pipe(
            switchMap(async ([play, seekTime]) => {
              if (!play) {
                playOrPauseVideo(false);
                return EMPTY;
              }

              if (seekTime) {
                media.currentTime = seekTime;
              }

              return playOrPauseVideo(true);
            })
          );
        })
      )
      .subscribe();

    return () => sub.unsubscribe();
  }, [media$, play$, seekTime$, playOrPauseVideo]);
};

const VideoHtmlElement = memo(
  ({
    videoConfig,
    mediaRef: videoRef,
    media,
    play,
    seekTime,
    handleVideoEvent,
    handleVideoStartedPlaying,
    playOrPauseMedia: playOrPauseVideo,
    visible,
    muted,
  }: VideoHtmlElementProps) => {
    usePlayAndSeek(
      {
        media,
        play,
        seekTime,
      },
      playOrPauseVideo
    );

    const videoType = videoConfig?.type || "stored video";

    if (videoType === "stored video") {
      return (
        <NonTransformedHtml>
          <StoredVideoElement
            videoConfig={videoConfig as StoredVideoConfig}
            videoRef={videoRef}
            handleVideoMetadataLoaded={handleVideoEvent}
            handleVideoStartedPlaying={handleVideoStartedPlaying}
            visible={visible}
            muted={muted}
          />
        </NonTransformedHtml>
      );
    }

    if (videoConfig?.liveStream?.muxPlaybackId) {
      return (
        <NonTransformedHtml>
          <LiveStreamVideoElement
            videoRef={videoRef}
            muxPlaybackId={videoConfig?.liveStream?.muxPlaybackId}
            handleVideoMetadataLoaded={handleVideoEvent}
            handleVideoStartedPlaying={handleVideoStartedPlaying}
            visible={visible}
            muted={muted}
          />
        </NonTransformedHtml>
      );
    }

    return null;
  }
);

export default VideoHtmlElement;
