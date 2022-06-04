import React, { memo, useEffect, useState } from "react";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { Object3D, PositionalAudio, Vector3 } from "three";
import { defaultVideoSoundConfig } from "defaultConfigs";
import {
  useBehaviorSubjectFromCurrentValue,
  useTakeUntilUnmount,
} from "hooks/useObservable";
import { getPositionalAudioVolume } from "hooks/usePeerPositionalAudio";
import { distanceSquared } from "hooks/usePlayerLocations";
import { usePositionFromCamera } from "hooks/usePositionFromCamera";
import { PositionalAudioConfig } from "spaceTypes";
import { Optional } from "types";

const DEFAULT_ROLLOF_FACTOR = 2;
const DEFAULT_REF_DISTANCE = 5;
const DEFAULT_MAX_DISTANCE = 10000;
const DEFAULT_DISTANCE_MODEL = "exponential";

export const usePositionalAudioConfigurer = ({
  positionalAudio,
  soundConfig = defaultVideoSoundConfig(),
}: {
  positionalAudio: Optional<PositionalAudio>;
  soundConfig: PositionalAudioConfig | undefined;
}) => {
  useEffect(() => {
    positionalAudio?.setRefDistance(
      soundConfig.refDistance || DEFAULT_REF_DISTANCE
    );
  }, [positionalAudio, soundConfig.refDistance]);

  useEffect(() => {
    positionalAudio?.setRolloffFactor(
      soundConfig.rollOffFactor || DEFAULT_ROLLOF_FACTOR
    );
  }, [positionalAudio, soundConfig.rollOffFactor]);

  useEffect(() => {
    positionalAudio?.setDistanceModel(DEFAULT_DISTANCE_MODEL);
  }, [positionalAudio, soundConfig.distanceModel]);

  useEffect(() => {
    positionalAudio?.setMaxDistance(
      soundConfig.maxDistance || DEFAULT_MAX_DISTANCE
    );
  }, [positionalAudio, soundConfig.maxDistance]);
};

export const usePositionalAudioPlayer = ({
  audioSourceNodeSet,
  play,
  positionalAudio,
}: {
  audioSourceNodeSet: boolean;
  play: boolean;
  positionalAudio: Optional<THREE.PositionalAudio>;
}) => {
  const [playing, setPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!audioSourceNodeSet) return;
    if (!positionalAudio) return;
    if (play) {
      positionalAudio.play();
      setPlaying(true);
    } else {
      positionalAudio.pause();
      setPlaying(false);
    }
  }, [play, positionalAudio, audioSourceNodeSet]);

  return playing;
};

const usePositionalAudioMediaSourceAttacher = ({
  positionalAudio,
  audioSource,
}: {
  positionalAudio: Optional<THREE.PositionalAudio>;
  audioSource: Optional<MediaElementAudioSourceNode>;
}) => {
  const [audioSourceNodeSet, setAudioSourceNodeSet] = useState(false);

  useEffect(() => {
    if (!positionalAudio || !audioSource) return;
    // @ts-ignore
    positionalAudio.setNodeSource(audioSource);
    setAudioSourceNodeSet(true);
  }, [positionalAudio, audioSource]);

  useEffect(() => {
    if (positionalAudio) {
      return () => {
        // cleanup - pause and disconnect audio
        positionalAudio.pause();
        positionalAudio.disconnect();
      };
    }
  }, [positionalAudio]);

  useEffect(() => {
    if (audioSource)
      return () => {
        // cleanup - disconnect audio source
        audioSource.disconnect();
      };
  }, [audioSource]);

  return audioSourceNodeSet;
};

export const usePositionalAudioMediaElementAttacher = ({
  positionalAudio,
  audioElement,
}: {
  positionalAudio: Optional<THREE.PositionalAudio>;
  audioElement: HTMLMediaElement | undefined;
}) => {
  const [audioSourceNodeSet, setAudioSourceNodeSet] = useState(false);

  useEffect(() => {
    if (!positionalAudio || !audioElement) return;
    positionalAudio.setMediaStreamSource(audioElement.srcObject as MediaStream);
    setAudioSourceNodeSet(true);
  }, [positionalAudio, audioElement]);

  useEffect(() => {
    if (positionalAudio) {
      return () => {
        // cleanup - pause and disconnect audio
        positionalAudio.pause();
        positionalAudio.disconnect();
      };
    }
  }, [positionalAudio]);

  return audioSourceNodeSet;
};

const SpatialSound = ({
  mediaElement,
  soundConfig,
  listener,
  play,
  setAudioPlaying,
}: {
  mediaElement: HTMLMediaElement;
  soundConfig: PositionalAudioConfig | undefined;
  listener: THREE.AudioListener;
  play: boolean;
  setAudioPlaying?: (playing: boolean) => void;
}) => {
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode>();

  const [
    positionalAudio,
    setPositionalAudio,
  ] = useState<PositionalAudio | null>(null);

  useEffect(() => {
    setAudioSource(listener.context.createMediaElementSource(mediaElement));
  }, [mediaElement, listener]);

  usePositionalAudioConfigurer({ positionalAudio, soundConfig });

  const audioSourceNodeSet = usePositionalAudioMediaSourceAttacher({
    positionalAudio,
    audioSource,
  });

  const playing = usePositionalAudioPlayer({
    audioSourceNodeSet,
    play,
    positionalAudio,
  });

  useEffect(() => {
    if (setAudioPlaying) setAudioPlaying(playing);
  }, [playing, setAudioPlaying]);

  if (!audioSource) return null;

  return (
    <group>
      <positionalAudio args={[listener]} ref={setPositionalAudio} />
    </group>
  );
};

const updateInterval = 500;

const DistanceBasedVolumeAdjuster = ({
  mediaElement,
  soundConfig,
  play,
  parentElement,
}: {
  mediaElement: HTMLMediaElement;
  soundConfig: PositionalAudioConfig;
  play: boolean;
  parentElement: Object3D;
}) => {
  const playing$ = useBehaviorSubjectFromCurrentValue(play);

  const position$ = usePositionFromCamera(updateInterval);

  const element$ = useBehaviorSubjectFromCurrentValue(mediaElement);

  const parentElement$ = useBehaviorSubjectFromCurrentValue(parentElement);

  const soundConfig$ = useBehaviorSubjectFromCurrentValue(soundConfig);

  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    combineLatest([playing$, position$, element$, parentElement$, soundConfig$])
      .pipe(
        map(([playing, position, element, parentElement, soundConfig]) => {
          let volume = 0;
          if (playing) {
            const parentPosition = new Vector3();
            parentElement.getWorldPosition(parentPosition);
            const distSquared = distanceSquared(position, [
              parentPosition.x,
              parentPosition.y,
              parentPosition.z,
            ]);

            volume = getPositionalAudioVolume(distSquared, soundConfig);
          }

          if (volume !== element.volume && !isNaN(volume)) {
            try {
              element.volume = volume;
            } catch (error) {
              console.error(error);
            }
          }
        })
      )
      .pipe(takeUntilUnmount())
      .subscribe();
  }, [
    element$,
    parentElement$,
    playing$,
    position$,
    soundConfig$,
    takeUntilUnmount,
  ]);

  return null;
};

const AudioSoundAdjuster = memo(
  ({
    mediaElement,
    soundConfig = defaultVideoSoundConfig(),
    listener,
    play,
    setAudioPlaying,
    spatialAudioEnabled,
    parentElement,
  }: {
    mediaElement: HTMLMediaElement;
    soundConfig: PositionalAudioConfig;
    listener: THREE.AudioListener;
    play: boolean;
    setAudioPlaying?: (playing: boolean) => void;
    spatialAudioEnabled: boolean | undefined;
    parentElement: Object3D;
  }) => {
    if (spatialAudioEnabled && soundConfig.mode !== "global")
      return (
        <SpatialSound
          mediaElement={mediaElement}
          soundConfig={soundConfig}
          listener={listener}
          play={play}
          setAudioPlaying={setAudioPlaying}
        />
      );
    return (
      <DistanceBasedVolumeAdjuster
        mediaElement={mediaElement}
        soundConfig={soundConfig}
        play={play}
        parentElement={parentElement}
      />
    );
  }
);

export default AudioSoundAdjuster;
