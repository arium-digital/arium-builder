import { useAudioMeter } from "Space/utils/audio-meter";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import { useContext, useEffect, useState } from "react";

const getAudioStream = async (
  audioElement: HTMLAudioElement
): Promise<MediaStream> => {
  if (audioElement.readyState < 3) {
    await new Promise((resolve) =>
      audioElement.addEventListener("canplay", resolve)
    );
  }

  // @ts-ignore
  if (audioElement.captureStream)
    // @ts-ignore
    return audioElement.captureStream() as MediaStream;
  // @ts-ignore
  else if (audioElement.mozCaptureStream)
    // @ts-ignore
    return audioElement.mozCaptureStream() as MediaStream;
  else throw new Error("video.captureStream() not supported");
};

const getAudioStreamTrack = async (audioElement: HTMLAudioElement) => {
  const audioStream = await getAudioStream(audioElement);

  return audioStream.getAudioTracks()[0];
};

export const useElementAudioVolume = (audio: HTMLAudioElement | null) => {
  const [audioStream, setAudioStream] = useState<
    MediaStreamTrack | undefined
  >();

  useEffect(() => {
    (async () => {
      if (audio) {
        const track = await getAudioStreamTrack(audio);

        setAudioStream(track);
      }
    })();
  }, [audio]);

  const audioContext = useContext(SpaceContext)?.audioContext;

  const volume$ = useAudioMeter({
    audioContext,
    audioStreamTrack: audioStream,
  });

  return volume$;
};
