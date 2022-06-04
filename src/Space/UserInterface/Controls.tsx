import React, { useEffect, useState, useCallback, memo, FC } from "react";
import styles from "../../css/controls.module.scss";

export const AudioPreview: FC<{ volumeLevel: number }> = ({ volumeLevel }) => {
  return (
    <mesh position={[0, 1.5, 0.5]}>
      <sphereBufferGeometry
        attach="geometry"
        args={[volumeLevel * 0.25, 12, 12]}
      />
      <meshPhongMaterial attach="material"></meshPhongMaterial>
    </mesh>
  );
};

const SimpleVideoSelfView: FC<{
  videoTrack?: MediaStreamTrack;
  // setVideoRef?: (video: HTMLVideoElement | null) => void;
  // peerMetadata: StringDict | undefined;
}> = memo(({ videoTrack }) => {
  const [videoPaused, setVideoPaused] = useState(true);

  const handleVideoPaused = useCallback(() => {
    setVideoPaused(true);
  }, []);

  const handleVideoPlaying = useCallback(() => {
    setVideoPaused(false);
  }, []);

  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [videoSourceNeedsUpdate, setVideoSourceNeedsUpdate] = useState(false);

  useEffect(() => {
    setVideoSourceNeedsUpdate(true);
  }, [videoTrack]);

  useEffect(() => {
    if (!videoSourceNeedsUpdate) return;

    if (videoTrack && video) {
      if (videoPaused) {
        // if there is a source object on the video, set a timeout
        // before set changing video to false to prevent some terrible
        // chrome error.
        video.srcObject = new MediaStream([videoTrack]);
        setVideoSourceNeedsUpdate(false);
      } else {
        video.pause();
      }
    }
  }, [videoTrack, videoSourceNeedsUpdate, video, videoPaused]);

  return (
    <>
      <video
        className={styles.clipCircle}
        ref={setVideo}
        autoPlay
        playsInline
        onPlaying={handleVideoPlaying}
        onPause={handleVideoPaused}
      />
    </>
  );
});

export default SimpleVideoSelfView;
