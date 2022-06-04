import { useEffect, useState, useRef } from "react";
import { BehaviorSubject } from "rxjs";

export const useAudioMeter = ({
  audioContext,
  audioStreamTrack,
  minDecibals = -100,
  maxDecibels = -5,
}: {
  audioContext: AudioContext | undefined;
  audioStreamTrack: MediaStreamTrack | undefined;
  minDecibals?: number;
  maxDecibels?: number;
}) => {
  const [analyser, setAnalyser] = useState<AnalyserNode>();
  const [source, setSource] = useState<MediaStreamAudioSourceNode>();
  const dataArray = useRef<Uint8Array>(new Uint8Array(0));
  const [volume$] = useState(new BehaviorSubject<number>(0));

  useEffect(() => {
    function createAnalyser() {
      if (audioContext) {
        audioContext.resume();
        const newAnalyser = audioContext.createAnalyser();
        newAnalyser.fftSize = 32;
        newAnalyser.minDecibels = minDecibals;
        newAnalyser.maxDecibels = maxDecibels;
        newAnalyser.smoothingTimeConstant = 0.9;
        dataArray.current = new Uint8Array(newAnalyser.frequencyBinCount);
        setAnalyser(newAnalyser);
      }
    }

    createAnalyser();
  }, [audioContext, minDecibals, maxDecibels]);

  useEffect(() => {
    function createSource() {
      if (!audioContext || !audioStreamTrack) return;
      const sourceStream = new MediaStream([audioStreamTrack]);

      try {
        const newSource = audioContext.createMediaStreamSource(sourceStream);
        setSource(newSource);
      } catch (e) {
        console.error(e);
      }
    }

    createSource();
  }, [audioContext, audioStreamTrack]);

  useEffect(() => {
    function connectSource() {
      if (!source || !analyser) return;
      source.connect(analyser);
    }
    connectSource();
  }, [source, analyser]);

  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      if (!analyser || !dataArray.current || !source) return;
      analyser.getByteFrequencyData(dataArray.current);
      let sum = 0.0;
      for (let i = 4; i < dataArray.current.length / 2; i += 2) {
        sum += dataArray.current[i];
      }

      const rms = sum / ((dataArray.current.length / 2 - 4) / 2) / 256;
      volume$.next(rms);
      animationFrameId = requestAnimationFrame(update);
    };

    update();

    // cleanup - on update start new animation frame
    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [analyser, dataArray, source, volume$]);

  return volume$;
};
