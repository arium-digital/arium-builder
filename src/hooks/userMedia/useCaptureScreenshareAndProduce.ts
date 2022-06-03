import { createMediaElementForStream } from "components/Consumers/hooks/useConsumers";
import { useBehaviorSubjectFromCurrentValue } from "hooks/useObservable";
import { useCallback, useEffect, useState } from "react";
import { BehaviorSubject, fromEvent, Observable } from "rxjs";
import { SessionPaths } from "shared/dbPaths";
import { ScreenSharingContext } from "types";
import { ProducerTransportObservable, useProducer } from "./useProducer";

const screenShareConstraints: MediaStreamConstraints = {
  video: {
    // @ts-ignore
    cursor: "always",
  },
  audio: {
    sampleRate: 44100,
    sampleSize: 16,
    channelCount: 2,
    echoCancellation: true,
  },
};

function useVideoElementForStream(stream: MediaStream | undefined) {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement>();

  useEffect(() => {
    if (stream) {
      if (!videoElement) {
        const newVideoElement = createMediaElementForStream({
          stream,
          mute: true,
        }) as HTMLVideoElement;

        (async () => {
          await newVideoElement.play();

          setVideoElement(newVideoElement);
        })();

        return;
      } else {
        if (videoElement.srcObject !== stream) {
          videoElement.srcObject = stream;
          videoElement.play();
        }
        return;
      }
    } else {
      if (videoElement) {
        videoElement.pause();
        videoElement.srcObject = null;
        return;
      }
    }
  }, [stream, videoElement]);

  return videoElement;
}

const captureScreenShareTracks = async () => {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia(
      screenShareConstraints
    );
  } catch (e) {
    console.error(e);

    return undefined;
  }
  if (!stream) return undefined;

  const video = stream.getVideoTracks()[0];
  const audio = stream.getAudioTracks()[0];

  return {
    videoTrack: video,
    audioTrack: audio,
    stream,
  };
};

const useCaptureScreenshareAndProduce = ({
  producingTransport$,
  sessionPaths$,
  spaceId$,
}: {
  producingTransport$: ProducerTransportObservable;
  sessionPaths$: Observable<SessionPaths | undefined>;
  spaceId$: Observable<string>;
}): ScreenSharingContext => {
  const [tracks, setTracks] = useState<
    | {
        audioTrack: MediaStreamTrack | undefined;
        videoTrack: MediaStreamTrack | undefined;
        stream: MediaStream;
      }
    | undefined
  >();

  const capture = useCallback(async () => {
    const tracks = await captureScreenShareTracks();
    setTracks(tracks);
  }, []);

  useEffect(() => {
    if (!tracks?.audioTrack) return;

    const sub = fromEvent(tracks.audioTrack, "ended").subscribe({
      next: () => {
        setTracks((existing) => {
          if (!existing) return;

          return {
            ...existing,
            audioTrack: undefined,
          };
        });
      },
    });

    return () => sub.unsubscribe();
  }, [tracks?.audioTrack]);

  useEffect(() => {
    if (!tracks?.videoTrack) return;

    const sub = fromEvent(tracks.videoTrack, "ended").subscribe({
      next: () => {
        setTracks((existing) => {
          if (!existing) return;

          return {
            ...existing,
            videoTrack: undefined,
          };
        });
      },
    });

    return () => sub.unsubscribe();
  }, [tracks?.videoTrack]);

  const [produce$] = useState(() => new BehaviorSubject(true));

  const screenTrack$ = useBehaviorSubjectFromCurrentValue(tracks?.videoTrack);
  const audioTrack$ = useBehaviorSubjectFromCurrentValue(tracks?.audioTrack);

  useProducer({
    producingTransport$,
    track$: screenTrack$,
    enteredSpace$: produce$,
    kind: "screenVideo",
    sessionPaths$,
    spaceId$,
    userMediaPaused: !tracks?.videoTrack,
  });

  useProducer({
    producingTransport$,
    track$: audioTrack$,
    enteredSpace$: produce$,
    kind: "screenAudio",
    sessionPaths$,
    spaceId$,
    userMediaPaused: !tracks?.audioTrack,
  });

  const videoElement = useVideoElementForStream(tracks?.stream);

  const videoElement$ = useBehaviorSubjectFromCurrentValue(videoElement);

  const sharing$ = useBehaviorSubjectFromCurrentValue(
    !!tracks?.videoTrack || !!tracks?.audioTrack
  );

  return {
    capture,
    sharing$,
    videoElement$,
  };
};

export default useCaptureScreenshareAndProduce;
