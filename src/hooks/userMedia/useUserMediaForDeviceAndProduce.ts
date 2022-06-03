import {
  trackFailedRequestingMedia,
  trackSucceededRequestingMedia,
} from "analytics/onboarding";
import { AudioQuality, VideoResolution } from "communicationTypes";
import { UserMediaForDevice } from "components/componentTypes";
import { useBehaviorSubjectFromCurrentValue } from "hooks/useObservable";
import { Dispatch, useState, useCallback, SetStateAction } from "react";
import { Observable } from "rxjs";
import { SessionPaths } from "shared/dbPaths";
import { MediaTrackKind } from "../../../shared/communication";
import { ProducerTransportObservable, useProducer } from "./useProducer";

export type VIDEO_RESOLUTIONS = "qvga" | "vga" | "hd";

export const VIDEO_CONSTRAINTS = {
  qvga: { width: { ideal: 320 }, height: { ideal: 240 } },
  vga: { width: { ideal: 640 }, height: { ideal: 480 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
};

export const AUDIO_CONSTRAINTS = {
  hd: {
    sampleRate: 44100,
    channelCount: 2,
  },
  sd: {},
};

export const getVideoConstraints = (videoResolution: VideoResolution) =>
  VIDEO_CONSTRAINTS[videoResolution] || {};

export const getMicConstraints = (micQuality: AudioQuality) =>
  AUDIO_CONSTRAINTS[micQuality] || {};

export const getVideoMediaConstraints = (videoResolution: VideoResolution) => (
  deviceId: string | undefined
): MediaStreamConstraints => ({
  audio: false,
  video: {
    deviceId: deviceId ? { exact: deviceId } : undefined,
    ...getVideoConstraints(videoResolution),
  },
});

export const getMicMediaConstraints = (micQuality: AudioQuality) => (
  deviceId: string | undefined
): MediaStreamConstraints => ({
  audio: {
    deviceId: deviceId ? { exact: deviceId } : undefined,
    ...getMicConstraints(micQuality),
  },
  video: false,
});

export const failedEvent = "Failed requesting media";
export const succeededEvent = "Succeeded requesting media";

const useUserMediaForDeviceAndProduce = ({
  initialized,
  getConstraints,
  track,
  deviceList,
  producingTransport$,
  kind,
  sessionPaths$,
  spaceId$,
  produce$,
}: {
  initialized: boolean;
  getConstraints: (deviceId: string | undefined) => MediaStreamConstraints;
  track: "microphone" | "webcam";
  deviceList: MediaDeviceInfo[];
  kind: MediaTrackKind;
  producingTransport$: ProducerTransportObservable;
  produce$: Observable<boolean>;
  sessionPaths$: Observable<SessionPaths | undefined>;
  spaceId$: Observable<string>;
}): UserMediaForDevice & {
  setStream: (streamAndDeviceId: {
    stream: MediaStreamTrack | undefined;
    deviceId: string | undefined;
  }) => void;
  setStreamState: Dispatch<
    SetStateAction<{
      failedGetting: boolean;
      getting: boolean;
    }>
  >;
  updateStreamFromDevice: (
    deviceId?: string,
    recapture?: boolean
  ) => Promise<void>;
} => {
  const [
    { stream, deviceId: currentDeviceId },
    setStreamAndDeviceId,
  ] = useState<{
    stream: MediaStreamTrack | undefined;
    deviceId: string | undefined;
  }>({
    stream: undefined,
    deviceId: undefined,
  });

  const [streamState, setStreamState] = useState({
    getting: false,
    failedGetting: false,
  });

  const failedGettingStream = streamState.failedGetting;

  const gettingStream = streamState.getting;

  const updateStreamFromDevice = useCallback(
    async (deviceId?: string, recapture = false) => {
      if (!initialized || gettingStream) return;
      if (deviceId && deviceId === currentDeviceId && !recapture) return;

      const constraints: MediaStreamConstraints = getConstraints(deviceId);
      setStreamState({
        getting: true,
        failedGetting: false,
      });
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.error(e);
        setStreamState({
          failedGetting: true,
          getting: false,
        });
        trackFailedRequestingMedia({ kind: track });
        return;
      }

      trackSucceededRequestingMedia({ kind: track });

      setStreamAndDeviceId(({ stream: existing }) => {
        if (existing) existing.stop();
        const newTrack =
          track === "microphone"
            ? stream.getAudioTracks()[0]
            : stream.getVideoTracks()[0];
        const newDeviceId = newTrack.getSettings().deviceId;

        return {
          stream: newTrack,
          deviceId: newDeviceId,
        };
      });

      setStreamState({
        failedGetting: false,
        getting: false,
      });
    },
    [currentDeviceId, getConstraints, gettingStream, initialized, track]
  );

  const pause = useCallback(async () => {
    if (stream) {
      stream.stop();
      setStreamAndDeviceId((existing) => ({
        stream: undefined,
        deviceId: existing.deviceId,
      }));
    }
  }, [stream]);

  const resume = useCallback(async () => {
    return updateStreamFromDevice(undefined, true);
  }, [updateStreamFromDevice]);

  const selectSendingDevice = useCallback(
    async (deviceId?: string) => {
      if (!initialized) return;

      deviceList.forEach((device) => {
        if (deviceId === device.deviceId) {
          updateStreamFromDevice(deviceId);
        }
      });
    },
    [deviceList, initialized, updateStreamFromDevice]
  );

  const paused = !stream && !gettingStream;

  const track$ = useBehaviorSubjectFromCurrentValue(stream);

  useProducer({
    producingTransport$,
    track$,
    kind,
    enteredSpace$: produce$,
    sessionPaths$: sessionPaths$,
    spaceId$,
    userMediaPaused: paused,
  });

  return {
    sendingDeviceId: currentDeviceId,
    gettingStream,
    deviceList,
    failedGettingStream,
    pause,
    resume,
    paused,
    selectSendingDevice,
    sendingStream: stream,
    setStream: setStreamAndDeviceId,
    setStreamState,
    updateStreamFromDevice,
  };
};

export default useUserMediaForDeviceAndProduce;
