import { useThree } from "@react-three/fiber";
import NonTransformedHtml from "components/utils/NonTransformedHtml";
import { Timestamp } from "db";
import { defaultAudioConfig } from "defaultConfigs/useDefaultNewElements";
import { useFileDownloadUrl } from "fileUtils";
import { useConfigOrDefaultRecursiveConcrete } from "hooks/spaceHooks";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import {
  Suspense,
  SyntheticEvent,
  useCallback,
  useContext,
  useState,
} from "react";
import { Transform } from "spaceTypes";
import { AudioConfig } from "spaceTypes/audio";
import { Vector3 } from "three";
// import { Object3D } from "three";
import { Optional } from "types";
import AudioSoundAdjuster from "../Video/AudioSoundAdjuster";
import { usePlayAudio } from "../Video/usePlay";
import { useMediaElementAndPlay } from "../Video/VideoElement";
import { usePlayAndSeek } from "../Video/VideoHtmlElement";

import PositionalAudioHelper from "./PositionalAudioHelper";
import SpeakerVisualizer from "./SpeakerVisualizer";

const AudioElement = ({
  config,
  lastActive,
  muted,
  showHelper,
  elementTransform,
}: {
  config?: AudioConfig;
  lastActive?: Timestamp;
  muted?: boolean;
  showHelper?: boolean;
  elementTransform: Transform | undefined;
}) => {
  const values = useConfigOrDefaultRecursiveConcrete<
    Pick<AudioConfig, "playSettings" | "positionalAudio">
  >(config, defaultAudioConfig);

  const playSettings = values.playSettings;

  const spaceContext = useContext(SpaceContext);

  const [groupRef, setGroupRef] = useState<Optional<THREE.Object3D>>();

  const { camera } = useThree();

  const getDistanceFromSoundSquared = useCallback(() => {
    if (!groupRef) return 0;

    const worldPosition = new Vector3();

    groupRef.getWorldPosition(worldPosition);

    return camera.position.distanceToSquared(worldPosition);
  }, [groupRef, camera]);

  const { setMediaDuration, shouldPlay, seekTime } = usePlayAudio({
    initialized$: spaceContext?.initialized$,
    playSettings,
    serverTimeOffset$: spaceContext?.serverTimeOffset$,
    playStartTime: lastActive,
    disabled: false,
    getDistanceFromSoundSquared,
  });

  const handleAudioDataLoaded = useCallback(
    (e: SyntheticEvent<HTMLAudioElement>) => {
      const audioElement = e.target as HTMLAudioElement;
      const { duration } = audioElement;

      setMediaDuration(duration);
    },
    [setMediaDuration]
  );

  const [audio, setAudio] = useState<HTMLMediaElement | null>(null);

  const { playOrPauseMedia } = useMediaElementAndPlay({ media: audio });

  const play = shouldPlay;

  usePlayAndSeek(
    {
      media: audio,
      play,
      seekTime,
    },
    playOrPauseMedia
  );

  const fileUrl = useFileDownloadUrl(config?.audioFile);

  const listener = useCurrentValueFromObservable(spaceContext?.listener$, null);

  return (
    <group ref={setGroupRef}>
      {fileUrl && (
        <>
          <NonTransformedHtml>
            <audio
              crossOrigin="anonymous"
              controls
              playsInline
              loop
              // fires when first frame of video has been loaded
              onLoadedData={handleAudioDataLoaded}
              ref={setAudio}
              preload="metadata"
              muted={muted}
              src={fileUrl}
            ></audio>
          </NonTransformedHtml>
          {listener && audio && groupRef && !muted && (
            <AudioSoundAdjuster
              listener={listener}
              play={play}
              soundConfig={values.positionalAudio}
              mediaElement={audio}
              // setAudioPlaying={setAudioPlaying}
              spatialAudioEnabled={spaceContext?.spatialAudioEnabled}
              parentElement={groupRef}
            />
          )}
        </>
      )}
      );
      {showHelper && (
        <>
          <Suspense fallback={null}>
            <SpeakerVisualizer />
          </Suspense>
          <PositionalAudioHelper
            positionalAudioConfig={values.positionalAudio}
            elementTransform={elementTransform}
            audio={audio || null}
            maxPlayDistance={values.playSettings.maxDistance}
            alwaysShow
          />
        </>
      )}
    </group>
  );
};

export default AudioElement;
