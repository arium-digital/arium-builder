import { VideoConfig } from "spaceTypes";
import { MetadataDetermined } from "./VideoHtmlElement";
import { memo, useState, useEffect, Suspense } from "react";
import { videoThumbnailUrl } from "./videoUtils";
import { useMemo } from "react";
import { VideoThumbnailConfig } from "spaceTypes/video";
import { useTexture } from "@react-three/drei";
import { Texture } from "three";

const ThumbnailImageElement = ({
  filePath,
  imageRef,
  metadataDetermined,
}: {
  filePath: string;
  imageRef: (image: Texture) => void;
  metadataDetermined: MetadataDetermined;
}) => {
  const texture = useTexture(filePath);

  useEffect(() => {
    if (texture.image) {
      const image = texture.image as HTMLImageElement;
      const width = image.naturalWidth;
      const height = image.naturalHeight;

      metadataDetermined({ aspectRatio: width / height });

      imageRef(texture);
    }
  }, [texture, metadataDetermined, imageRef]);

  return null;
};

const VideoThumbnail = memo(
  ({
    config,
    imageRef,
    metadataDetermined,
    visible = true,
    settings,
  }: {
    config: VideoConfig;
    imageRef: (image: Texture) => void;
    metadataDetermined: MetadataDetermined;
    visible?: boolean;
    settings: VideoThumbnailConfig | undefined;
  }) => {
    const [shouldLoadMedia, setShouldLoadMedia] = useState(false);

    useEffect(() => {
      if (visible) {
        setShouldLoadMedia(true);
      }
    }, [visible]);

    const imageUrl = useMemo(
      () =>
        videoThumbnailUrl({
          storedVideo: config.storedVideo,
          storedVideos: config.storedVideos,
          liveStream: config.liveStream,
          type: config.type,
          thumbnailConfig: settings,
        }),
      [
        config.storedVideo,
        config.storedVideos,
        config.liveStream,
        config.type,
        settings,
      ]
    );

    if (!imageUrl || !shouldLoadMedia) return null;

    return (
      <Suspense fallback={null}>
        <ThumbnailImageElement
          filePath={imageUrl}
          imageRef={imageRef}
          metadataDetermined={metadataDetermined}
        />
      </Suspense>
    );
  }
);

export default VideoThumbnail;
