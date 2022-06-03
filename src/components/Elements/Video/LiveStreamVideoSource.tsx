import { DEFAULT_VIDEO_THUMBNAIL_WIDTH } from "defaultConfigs";
import Hls, { Level } from "hls.js";
import { useEffect, useState } from "react";

const muxUrl = (playbackId: string) =>
  `https://stream.mux.com/${playbackId}.m3u8`;

export const muxThumbnailUrl = ({
  playbackId,
  width = DEFAULT_VIDEO_THUMBNAIL_WIDTH,
  time = 0,
}: {
  playbackId: string;
  width?: number;
  time?: number;
}) => {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}&width=${width}`;
};

const useLiveStreamVideoSource = ({
  videoElement,
  muxPlaybackId,
  levelsDetermined,
}: {
  videoElement: HTMLVideoElement | undefined;
  muxPlaybackId?: string;
  levelsDetermined?: (levels: Level[]) => void;
}) => {
  const [hls, setHls] = useState<Hls>();

  useEffect(() => {
    if (!muxPlaybackId || !videoElement) return;

    const src = muxUrl(muxPlaybackId);
    // Let native HLS support handle it if possible
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(src);
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // try to recover network error
              console.error("fatal network error encountered, try to recover");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("fatal media error encountered, try to recover");
              hls.recoverMediaError();
              break;
            default:
              // cannot recover
              hls.destroy();
              break;
          }
        }
      });

      setHls(hls);

      return () => {
        hls.detachMedia();
        hls.destroy();
      };
    } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      videoElement.src = src;

      return () => {
        videoElement.src = "";
      };
    }
  }, [muxPlaybackId, videoElement]);

  useEffect(() => {
    if (!hls) return;
    if (!levelsDetermined) return;
    const handleDetermined = (event: any, data: { levels: Level[] }) => {
      levelsDetermined(data.levels);
    };

    hls.on(Hls.Events.MANIFEST_PARSED, handleDetermined);

    return () => hls.off(Hls.Events.MANIFEST_PARSED, handleDetermined);
  }, [hls, levelsDetermined]);
};

const LiveStreamVideoSource = ({
  videoElement,
  muxPlaybackId,
  levelsDetermined,
}: {
  videoElement: HTMLVideoElement | undefined;
  muxPlaybackId?: string;
  levelsDetermined?: (levels: Level[]) => void;
}) => {
  useLiveStreamVideoSource({ videoElement, muxPlaybackId, levelsDetermined });

  return null;
};

export const useLiveStreamMetadata = ({
  muxPlaybackId,
  levelsDetermined,
}: {
  muxPlaybackId?: string;
  levelsDetermined?: (levels: Level[]) => void;
}) => {
  const [video, setVideo] = useState<HTMLVideoElement>();

  useEffect(() => {
    const video = document.createElement("video");
    video.setAttribute("style", "display:none");
    video.setAttribute("muted", "true");
    video.setAttribute("cross-origin", "anonymous");

    setVideo(video);

    return () => {
      video.remove();
    };
  }, [muxPlaybackId]);

  useLiveStreamVideoSource({
    videoElement: video,
    muxPlaybackId,
    levelsDetermined,
  });
};

export const useAutoSetResolution = ({
  availableResolutions,
  selectedValue,
  maxRecommendedResolution,
  handleSetResolution,
}: {
  availableResolutions: string[] | undefined;
  selectedValue: number | undefined;
  handleSetResolution: (resolution: number) => void;
  maxRecommendedResolution: number;
}) => {
  useEffect(() => {
    if (!availableResolutions) return;
    let selectBestResolution = false;
    if (!selectedValue) {
      selectBestResolution = true;
    } else {
      const isValidResolution = availableResolutions.find(
        (x) => +x === selectedValue
      );
      selectBestResolution = !isValidResolution;
    }

    if (selectBestResolution) {
      const resolutionsLessThanMaxRecommended = availableResolutions.filter(
        (x) => +x <= maxRecommendedResolution
      );

      const toSelect =
        resolutionsLessThanMaxRecommended.length <= 1
          ? resolutionsLessThanMaxRecommended[0]
          : resolutionsLessThanMaxRecommended[
              resolutionsLessThanMaxRecommended.length - 1
            ];

      if (toSelect) {
        const recommendedResolution = +toSelect;
        if (recommendedResolution) handleSetResolution(recommendedResolution);
      }
    }
  }, [
    availableResolutions,
    handleSetResolution,
    maxRecommendedResolution,
    selectedValue,
  ]);
};

export default LiveStreamVideoSource;
