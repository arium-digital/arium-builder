import { useEffect, useState } from "react";
import * as THREE from "three";
import VideoTexture from "../components/utils/VideoTexture";

export const useVideoTexture = ({
  video,
}: {
  video: HTMLVideoElement | undefined | null;
}): VideoTexture | undefined => {
  // @ts-ignore
  const [videoTexture, setVideoTexture] = useState<VideoTexture>();

  useEffect(() => {
    if (!video) return;
    const minFilter = THREE.LinearFilter;
    const magFilter = THREE.LinearFilter;

    const newVideoTexture = new VideoTexture(video, magFilter, minFilter);

    newVideoTexture.encoding = THREE.sRGBEncoding;

    setVideoTexture(newVideoTexture);

    return () => {
      // clean up - dispose of texture
      setVideoTexture(undefined);
      newVideoTexture.dispose();
    };
  }, [video]);

  return videoTexture;
};
