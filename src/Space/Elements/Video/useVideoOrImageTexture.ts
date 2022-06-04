import { useEffect, useMemo, useState } from "react";
import {
  LinearFilter,
  RGBFormat,
  sRGBEncoding,
  RGBAFormat,
  Texture,
  VideoTexture,
} from "three";

// import VideoTexture from "components/utils/VideoTexture";

const minFilter = LinearFilter;
const magFilter = LinearFilter;

const useVideoOrImageTexture = ({
  videoElement,
  imageTexture,
  useImage,
  transparent,
}: {
  videoElement: HTMLVideoElement | null;
  imageTexture: Texture | undefined;
  useImage: boolean;
  transparent: boolean | undefined;
}) => {
  const [videoTexture, setVideoTexture] = useState<Texture>();

  const pixelFormat = useMemo(() => (transparent ? RGBAFormat : RGBFormat), [
    transparent,
  ]);

  useEffect(() => {
    if (imageTexture) {
      imageTexture.format = pixelFormat;
      imageTexture.encoding = sRGBEncoding;
      imageTexture.needsUpdate = true;
    }
  }, [imageTexture, pixelFormat]);

  useEffect(() => {
    if (videoElement) {
      const texture = new VideoTexture(
        videoElement,
        undefined,
        undefined,
        undefined,
        magFilter,
        minFilter,
        pixelFormat
      );

      texture.needsUpdate = true;
      texture.encoding = sRGBEncoding;

      setVideoTexture(texture);
      return () => {
        texture.dispose();
      };
    }
  }, [videoElement, pixelFormat]);

  const textureToUse = useMemo(() => {
    if (useImage) return imageTexture;

    if (!videoTexture) return imageTexture;

    return videoTexture;
  }, [useImage, imageTexture, videoTexture]);

  return textureToUse;
};

export default useVideoOrImageTexture;
