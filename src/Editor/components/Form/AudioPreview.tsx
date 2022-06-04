import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { FileLocation, LiveStreamConfig, PlaySettings } from "spaceTypes";
import LiveStreamVideoSource from "Space/Elements/Video/LiveStreamVideoSource";
import { useFileDownloadUrl } from "fileUtils";

export const StoredAudioPreview = ({
  audioSource,
  playSettings,
}: {
  audioSource?: FileLocation;
  playSettings?: PlaySettings;
}) => {
  const handleMetadataLoaded = useCallback(
    (e: SyntheticEvent<HTMLMediaElement>) => {
      // pass
      // const audioElement = e.target as HTMLMediaElement;
      // if (startTime) audioElement.currentTime = startTime;
    },
    []
  );

  const [refresh, setRefresh] = useState(false);

  const fileUrl = useFileDownloadUrl(audioSource);

  useEffect(() => {
    setRefresh(true);

    setTimeout(() => {
      setRefresh(false);
    }, 100);
  }, [fileUrl]);

  if (refresh || !fileUrl) return null;

  return (
    <>
      <audio
        crossOrigin="anonymous"
        controls
        playsInline
        loop
        // fires when first frame of video has been loaded
        onLoadedData={handleMetadataLoaded}
        preload="metadata"
        src={fileUrl}
      ></audio>
    </>
  );
};

export const LiveStreamPreview = ({
  playSettings,
  liveStream,
}: {
  playSettings?: PlaySettings;
  liveStream?: LiveStreamConfig;
}) => {
  // const { startTime } = useConfigOrDefaultRecursive(
  //   playSettings,
  //   defaultPlaySettings
  // );

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
