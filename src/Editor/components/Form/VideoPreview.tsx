import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { LiveStreamConfig, PlaySettings } from "spaceTypes";
import { VideoSource } from "Space/Elements/Video/VideoHtmlElement";
import LiveStreamVideoSource from "Space/Elements/Video/LiveStreamVideoSource";
import { FileLocation } from "../../../../shared/sharedTypes";

export type SingleOrMultipleVideoSource =
  | FileLocation
  | {
      location: FileLocation;
      extension: string;
    }[];

function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value);
}

export const StoredVideoPreview = ({
  videoSource,
  playSettings,
}: {
  videoSource?: SingleOrMultipleVideoSource;
  playSettings?: PlaySettings;
}) => {
  const handleVideoMetadataLoaded = useCallback(
    (e: SyntheticEvent<HTMLVideoElement>) => {
      // pass
      // const videoElement = e.target as HTMLVideoElement;
    },
    []
  );

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(true);

    setTimeout(() => {
      setRefresh(false);
    }, 100);
  }, [videoSource]);

  if (refresh) return null;

  return (
    <video
      crossOrigin="anonymous"
      preload="metadata"
      loop
      onLoadedMetadata={handleVideoMetadataLoaded}
      controls
      style={{ width: "100%" }}
    >
      {videoSource && !isArray(videoSource) && (
        <VideoSource file={videoSource} />
      )}
      {videoSource &&
        isArray(videoSource) &&
        videoSource.map(
          ({ extension, location }) =>
            location && (
              <VideoSource
                key={extension}
                file={location}
                fileExtension={extension}
              />
            )
        )}
    </video>
  );
};

export const LiveStreamPreview = ({
  playSettings,
  liveStream,
}: {
  playSettings?: PlaySettings;
  liveStream?: LiveStreamConfig;
}) => {
  const handleVideoMetadataLoaded = useCallback(
    (e: SyntheticEvent<HTMLVideoElement>) => {
      // pass
      // const videoElement = e.target as HTMLVideoElement;
      // if (startTime) videoElement.currentTime = startTime;
    },
    []
  );

  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(true);

    setTimeout(() => {
      setRefresh(false);
    }, 100);
  }, [liveStream]);

  if (!liveStream) return null;

  if (refresh) return null;

  return (
    <>
      <video
        ref={setVideoRef}
        crossOrigin="anonymous"
        preload="metadata"
        loop
        onLoadedMetadata={handleVideoMetadataLoaded}
        controls
        style={{ width: "100%" }}
      />
      {videoRef && liveStream.muxPlaybackId && (
        <LiveStreamVideoSource
          videoElement={videoRef}
          muxPlaybackId={liveStream.muxPlaybackId}
        />
      )}
    </>
  );
};
