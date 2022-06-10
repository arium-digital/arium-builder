import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

// scraped from
// https://github.com/vercel/next.js/blob/canary/examples/with-mux-video/components/video-player.js

export const HLSVideo = ({
  src,
  disableControl,
  ...restVideoProps
}: React.ComponentProps<"video"> & {
  src: string;
  disableControl?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (disableControl) video.controls = false;

    const hls = new Hls({
      capLevelToPlayerSize: true,
    });

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // This will run in safari, where HLS is supported natively
      video.src = src;
    } else if (Hls.isSupported()) {
      // This will run in all other modern browsers
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      console.error(
        "This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API"
      );
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [disableControl, src, videoRef]);

  return <video {...restVideoProps} ref={videoRef} />;
};
