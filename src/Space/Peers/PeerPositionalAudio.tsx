import { useState } from "react";
// import { BehaviorSubject, Observable, combineLatest } from "rxjs";
// import {
//   bufferTime,
//   distinctUntilChanged,
//   map,
//   pluck,
//   switchMap,
// } from "rxjs/operators";
// import { BroadcastersAndAudioSettings } from "../../communicationTypes";
// import {
//   DEFAULT_MAX_DISTANCE,
//   DEFAULT_REF_DISTANCE,
//   DEFAULT_ROLLOF_FACTOR,
// } from "../../defaultConfigs";
// import {
//   useBehaviorSubjectFromCurrentValue,
//   useCurrentValueFromBehaviorSubject,
//   useTakeUntilUnmount,
// } from "../../hooks/useObservable";
// import { filterUndefined } from "../../libs/rx";
// import { last } from "../../libs/utils";
import { PositionalAudioConfig } from "../../spaceTypes";
import {
  usePositionalAudioConfigurer,
  usePositionalAudioMediaElementAttacher,
  usePositionalAudioPlayer,
} from "Space/Elements/Video/AudioSoundAdjuster";
// import useStreamPlayer from "./useStreamPlayer";

// const clampToZeroOne = (value: number) => {
//   return Math.min(Math.max(0, value), 1);
// };

// function getPositionalAudioVolume(
//   distSquared: number,
//   config: PositionalAudioConfig
// ) {
//   const distance = Math.sqrt(distSquared);
//   const {
//     maxDistance = DEFAULT_MAX_DISTANCE,
//     distanceModel,
//     rollOffFactor = DEFAULT_ROLLOF_FACTOR,
//     refDistance = DEFAULT_REF_DISTANCE,
//   } = config;

//   if (distanceModel === "linear") {
//     return clampToZeroOne(
//       ((1 - rollOffFactor) * (distance - refDistance)) /
//         (maxDistance - refDistance)
//     );
//   } else {
//     // for now ignore inverse; consider all others exponential
//     return clampToZeroOne(
//       Math.pow(Math.max(distance, refDistance) / refDistance, -rollOffFactor)
//     );
//   }
// }

export const SpatialAudio = ({
  listener,
  audio,
  positionalAudioConfig,
  paused,
}: {
  listener: THREE.AudioListener | undefined;
  audio: HTMLAudioElement;
  positionalAudioConfig: PositionalAudioConfig;
  paused: boolean;
}) => {
  const [
    positionalAudio,
    setPositionalAudio,
  ] = useState<THREE.PositionalAudio | null>(null);

  const audioSourceNodeSet = usePositionalAudioMediaElementAttacher({
    positionalAudio,
    audioElement: audio,
  });

  usePositionalAudioConfigurer({
    positionalAudio,
    soundConfig: positionalAudioConfig,
  });

  usePositionalAudioPlayer({
    audioSourceNodeSet,
    play: !paused,
    positionalAudio,
  });

  if (!listener) return null;

  return (
    <group>
      <positionalAudio args={[listener]} ref={setPositionalAudio} />
    </group>
  );
};
