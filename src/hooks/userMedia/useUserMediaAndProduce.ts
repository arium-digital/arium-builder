import { AudioQuality, VideoResolution } from "communicationTypes";
import { UserMedia } from "components/componentTypes";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Observable } from "rxjs";
import { SessionPaths } from "shared/dbPaths";
import { ProducerTransportObservable } from "./useProducer";
import useUserMediaForDeviceAndProduce, {
  getMicConstraints,
  getMicMediaConstraints,
  getVideoConstraints,
  getVideoMediaConstraints,
  VIDEO_RESOLUTIONS,
} from "./useUserMediaForDeviceAndProduce";

async function getExternalVideoStream(
  videoElement: HTMLVideoElement
): Promise<MediaStream> {
  if (videoElement.readyState < 3) {
    await new Promise((resolve) =>
      videoElement.addEventListener("canplay", resolve)
    );
  }

  // @ts-ignore
  if (videoElement.captureStream)
    // @ts-ignore
    return videoElement.captureStream() as MediaStream;
  // @ts-ignore
  else if (videoElement.mozCaptureStream)
    // @ts-ignore
    return videoElement.mozCaptureStream() as MediaStream;
  else throw new Error("video.captureStream() not supported");
}

export const useMediaDevices = (externalVideoElement?: HTMLVideoElement) => {
  const [devices, setDevices] = useState<{
    audio: MediaDeviceInfo[];
    video: MediaDeviceInfo[];
  }>({
    audio: [],
    video: [],
  });

  const refreshAvailableDevices = useCallback(async () => {
    const devicesInfo = await navigator.mediaDevices.enumerateDevices();
    const audioDevices: MediaDeviceInfo[] = [];
    const videoDevices: MediaDeviceInfo[] = [];
    devicesInfo.forEach((device) => {
      if (device.kind === "audioinput") {
        audioDevices.push(device);
      } else if (device.kind === "videoinput") {
        videoDevices.push(device);
      }
    });
    setDevices({
      audio: audioDevices,
      video: videoDevices,
    });
  }, []);

  useEffect(() => {
    // onload, enumerate possible media devices
    if (externalVideoElement) return;
    refreshAvailableDevices();
  }, [refreshAvailableDevices, externalVideoElement]);

  return {
    ...devices,
    refreshAvailableDevices,
  };
};

export const useUserMediaAndProduce = ({
  initialized,
  externalVideoElement,
  useExternalVideo,
  invisible,
  videoResolution,
  micQuality,
  producingTransport$,
  sessionPaths$,
  spaceId$,
  produce$,
}: {
  initialized: boolean;
  useExternalVideo: boolean;
  invisible?: boolean;
  externalVideoElement: HTMLVideoElement | undefined;
  videoResolution: VideoResolution;
  micQuality: AudioQuality;
  producingTransport$: ProducerTransportObservable;
  produce$: Observable<boolean>;
  sessionPaths$: Observable<SessionPaths | undefined>;
  spaceId$: Observable<string>;
}): UserMedia => {
  const [accessRequestGranted, setAccessRequestGranted] = useState(false);

  const grantAccessRequestForWebcamAndMic = useCallback(() => {
    setAccessRequestGranted(true);
  }, []);

  const [resolution, setResolution] = useState<VIDEO_RESOLUTIONS>("vga");

  const {
    audio: audioDevicesInfo,
    video: videoDevicesInfo,
    refreshAvailableDevices,
  } = useMediaDevices(externalVideoElement);

  const micConstraintsGetter = useMemo(
    () => getMicMediaConstraints(micQuality),
    [micQuality]
  );

  const mic = useUserMediaForDeviceAndProduce({
    getConstraints: micConstraintsGetter,
    initialized: initialized,
    deviceList: audioDevicesInfo,
    track: "microphone",
    kind: "webcamAudio",
    produce$,
    producingTransport$,
    sessionPaths$,
    spaceId$,
  });

  const webcamConstraintsGeter = useMemo(
    () => getVideoMediaConstraints(resolution),
    [resolution]
  );

  const webcam = useUserMediaForDeviceAndProduce({
    getConstraints: webcamConstraintsGeter,
    initialized: initialized,
    deviceList: videoDevicesInfo,
    track: "webcam",
    kind: "webcamVideo",
    produce$,
    producingTransport$,
    sessionPaths$,
    spaceId$,
  });

  const setMicStream = mic.setStream;
  const setWebcamStream = webcam.setStream;

  const updateStreamsFromExternalVideo = useCallback(
    async (videoElement: HTMLVideoElement) => {
      const videoElementStream = await getExternalVideoStream(videoElement);
      const audioTrack = videoElementStream.getAudioTracks()[0].clone();
      const videoTrack = videoElementStream.getVideoTracks()[0].clone();

      setWebcamStream({
        stream: new MediaStream([videoTrack]).getTracks()[0],
        deviceId: undefined,
      });
      setMicStream({
        stream: new MediaStream([audioTrack]).getTracks()[0],
        deviceId: undefined,
      });
    },
    [setWebcamStream, setMicStream]
  );

  const setMicStreamState = mic.setStreamState;
  const setWebcamStreamState = webcam.setStreamState;

  const updateStreamsFromWebcamAndMic = useCallback(async () => {
    const constraints: MediaStreamConstraints = {
      audio: {
        ...getMicConstraints(micQuality),
      },
      video: {
        ...getVideoConstraints(resolution),
      },
    };
    setMicStreamState({
      failedGetting: false,
      getting: true,
    });
    setWebcamStreamState({
      failedGetting: false,
      getting: true,
    });

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      console.error(e);
      setMicStreamState({
        failedGetting: true,
        getting: false,
      });
      setWebcamStreamState({
        failedGetting: true,
        getting: false,
      });

      return;
    }
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    setMicStream({
      stream: audioTrack,
      deviceId: audioTrack.getSettings().deviceId,
    });
    setWebcamStream({
      stream: videoTrack,
      deviceId: videoTrack.getSettings().deviceId,
    });

    setMicStreamState({
      getting: false,
      failedGetting: false,
    });
    setWebcamStreamState({
      getting: false,
      failedGetting: false,
    });
  }, [
    micQuality,
    resolution,
    setMicStream,
    setMicStreamState,
    setWebcamStream,
    setWebcamStreamState,
  ]);

  useEffect(() => {
    if (!initialized) return;
    if (!externalVideoElement) return;
    updateStreamsFromExternalVideo(externalVideoElement);
  }, [initialized, externalVideoElement, updateStreamsFromExternalVideo]);

  const [hasRequestedInitialDevices, setHasRequestedInitialDevices] = useState(
    false
  );

  useEffect(() => {
    if (!initialized || invisible) return;
    if (useExternalVideo) return;
    if (hasRequestedInitialDevices) return;
    if (accessRequestGranted) {
      setHasRequestedInitialDevices(true);
      updateStreamsFromWebcamAndMic();
    }
  }, [
    accessRequestGranted,
    hasRequestedInitialDevices,
    initialized,
    invisible,
    updateStreamsFromWebcamAndMic,
    useExternalVideo,
  ]);

  const switchResolution = useCallback((res: string) => {
    if (res === "qvga") setResolution("qvga");
    else if (res === "vga") setResolution("vga");
    else if (res === "hd") setResolution("hd");
  }, []);

  useEffect(() => {
    switchResolution(videoResolution);
  }, [switchResolution, videoResolution]);

  const rerequestMedia = useCallback(() => {
    setTimeout(() => {
      updateStreamsFromWebcamAndMic();
    }, 200);
  }, [updateStreamsFromWebcamAndMic]);

  return {
    mic,
    webcam,
    switchResolution,
    refreshAvailableDevices,
    rerequestMedia,
    grantAccessRequestForWebcamAndMic,
    grantedAccessRequestForWebcamAndMic: accessRequestGranted,
  };
};
