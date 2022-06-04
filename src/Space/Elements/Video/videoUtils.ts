import { placeholderImageUrl } from "defaultConfigs";
import { getThumbnailUrl } from "media/mediaUrls";
import { useEffect, useState } from "react";
import { VideoConfig } from "spaceTypes";
import { VideoThumbnailConfig } from "spaceTypes/video";
import { muxThumbnailUrl } from "./LiveStreamVideoSource";

export interface Crop {
  cropLeft: number;
  cropRight: number;
  cropTop: number;
  cropBottom: number;
}
export const cropToOffsetAndScale = ({
  cropLeft,
  cropRight,
  cropTop,
  cropBottom,
}: Crop) => {
  const offset = {
    x: cropLeft,
    y: cropTop,
  };

  const scale = {
    x: cropRight - cropLeft,
    y: cropBottom - cropTop,
  };

  return {
    offset,
    scale,
  };
};

export const squareCropFromSize = ({
  width,
  height,
}: {
  width: number;
  height: number;
}): Crop => {
  const aspect = width / height;

  if (aspect > 1) {
    const toCrop = (aspect - 1) / 2;
    return {
      cropTop: 0,
      cropBottom: 1,
      cropLeft: toCrop,
      cropRight: 1 - toCrop,
    };
  } else {
    const toCrop = (1 - aspect) / 2;
    return {
      cropTop: toCrop,
      cropBottom: 1 - toCrop,
      cropLeft: 0,
      cropRight: 1,
    };
  }
};

export const videoThumbnailUrl = ({
  thumbnailConfig,
  type = "stored video",
  storedVideo,
  storedVideos,
  liveStream,
}: Pick<VideoConfig, "type" | "storedVideo" | "storedVideos" | "liveStream"> & {
  thumbnailConfig?: VideoThumbnailConfig;
}) => {
  const time = thumbnailConfig?.time;
  const width = thumbnailConfig?.width;
  if (type === "stored video") {
    if (storedVideo) return getThumbnailUrl(storedVideo, time, width);
    if (storedVideos) {
      if (storedVideos.mp4)
        return getThumbnailUrl(storedVideos.mp4, time, width);
    }

    return placeholderImageUrl("Video");
  }
  if (!liveStream?.muxPlaybackId) return null;

  return muxThumbnailUrl({
    playbackId: liveStream?.muxPlaybackId,
    time,
    width,
  });
};

export const useLegacyRotation = (legacyRotation: boolean | undefined) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setRotation(legacyRotation ? -Math.PI / 2 : 0);
  }, [legacyRotation]);

  return rotation;
};
