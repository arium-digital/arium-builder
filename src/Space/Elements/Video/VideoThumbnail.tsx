import { MetadataDetermined } from "./VideoHtmlElement";
import { memo, useState, useEffect, Suspense } from "react";
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
    imageRef,
    metadataDetermined,
    visible = true,
    imageUrl,
  }: {
    imageRef: (image: Texture) => void;
    metadataDetermined: MetadataDetermined;
    visible?: boolean;
    imageUrl: string;
  }) => {
    const [shouldLoadMedia, setShouldLoadMedia] = useState(false);

    useEffect(() => {
      if (visible) {
        setShouldLoadMedia(true);
      }
    }, [visible]);

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
