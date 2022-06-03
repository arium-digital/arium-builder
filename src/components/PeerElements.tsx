import { Html } from "@react-three/drei/web/Html";
import React, { useCallback } from "react";

export const AudioStreamElement = ({
  track,
  setNode,
}: {
  track: MediaStreamTrack;
  setNode: (element?: HTMLAudioElement) => void;
}) => {
  const ref = useCallback(
    (node: HTMLAudioElement) => {
      if (node && track) {
        node.srcObject = new MediaStream([track]);
        setNode(node);
      } else {
        setNode(undefined);
      }
    },
    [setNode, track]
  );

  return (
    <Html>
      <audio playsInline autoPlay ref={ref} />
    </Html>
  );
};

export const VideoStreamTrackElement = ({
  track,
  setNode,
  width,
  height,
}: {
  track: MediaStreamTrack;
  setNode: (element?: HTMLVideoElement) => void;
  width?: number;
  height?: number;
}) => {
  const ref = useCallback(
    (node: HTMLVideoElement) => {
      if (node && track) {
        node.srcObject = new MediaStream([track]);
        setNode(node);
      } else {
        setNode(undefined);
      }
    },
    [setNode, track]
  );

  return (
    <Html>
      <video
        playsInline
        autoPlay
        muted
        ref={ref}
        style={{ display: "none" }}
        width={width}
        height={height}
      />
    </Html>
  );
};
