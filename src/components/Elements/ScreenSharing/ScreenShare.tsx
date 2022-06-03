import React, { useEffect, useState, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Mesh, Object3D } from "three";
import { defaultSurfaceConfig, defaultScreenShareConfig } from "defaultConfigs";
import { useConfigOrDefault } from "hooks/spaceHooks";
import {
  PositionalAudioConfig,
  ScreenShareConfig,
  VideoAspect,
} from "spaceTypes";
import { PlaySurface } from "../PlaySurfaces";
import { NonPlayingPlaySurface } from "./NonPlayingPlaySurface";
// import { useProducer } from "../../hooks/useProducer";
import { AggregateObservedConsumers } from "communicationTypes";
import { toMediaPath } from "libs/utils";
import {
  useBehaviorSubjectFromCurrentValue,
  useCurrentValueFromBehaviorSubject,
  useCurrentValueFromObservable,
} from "hooks/useObservable";
import {
  BehaviorSubject,
  combineLatest,
  from,
  fromEvent,
  interval,
  Observable,
  Subject,
} from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  pluck,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs/operators";

import { SessionPaths } from "shared/dbPaths";
import captureOrReceiveScreenShare, {
  AudioAndVideoElement,
} from "./captureOrConsumerScreenShare";
import AudioSoundAdjuster from "../Video/AudioSoundAdjuster";
import { useVideoTexture } from "hooks/useVideoTexture";
import computeVideoSize, { Size } from "./computeVideoSize";
import { useContext } from "react";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import { PointerOverContext } from "hooks/useGlobalPointerOver";
import { Optional, ScreenSharingContext } from "types";

const hoverCheckDuration = 20;

const videoSizeFromAspect = ({
  aspect = "4:3",
}: {
  aspect?: VideoAspect;
}): Size => {
  const [width, height] = aspect.split(":").map((x) => +x);

  const aspectRatio = width / height;

  return {
    width: 1,
    height: 1 / aspectRatio,
  };
};

declare global {
  interface MediaDevices {
    getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  }

  // if constraints config still lose some prop, you can define it by yourself also
  interface MediaTrackConstraintSet {
    displaySurface?: ConstrainDOMString;
    logicalSurface?: ConstrainBoolean;
  }
}

const screenSharePositionalAudioConfig: PositionalAudioConfig = {
  refDistance: 20,
  rollOffFactor: 2,
  distanceModel: "exponential",
  maxDistance: 200,
};

const observeVideoSize = (videoElement: HTMLVideoElement) => {
  let videoSize$: Observable<Size>;

  if (videoElement.videoHeight && videoElement.videoWidth) {
    const { videoWidth, videoHeight } = videoElement;
    videoSize$ = from([
      {
        width: videoWidth,
        height: videoHeight,
      },
    ]);
  } else {
    videoSize$ = fromEvent(videoElement, "loadedmetadata").pipe(
      map(() => {
        const { videoWidth, videoHeight } = videoElement;
        return {
          width: videoWidth,
          height: videoHeight,
        };
      })
    );
  }

  return videoSize$.pipe(
    tap((size) => {
      videoElement.height = size.height;
      videoElement.width = size.width;
    })
  );
};

const ScreenShare = ({
  values,
  listener,
  path,
  spaceId,
  interactable,
  sessionPaths$,
  consumers$,
  activeSessions$,
  screenSharing,
  canScreenshare,
}: {
  values: ScreenShareConfig;
  listener: THREE.AudioListener | undefined;
  path: string[];
  spaceId: string;
  interactable?: boolean;
  sessionPaths$: Observable<SessionPaths | undefined>;
  consumers$: Observable<AggregateObservedConsumers>;
  activeSessions$: Observable<Set<string>>;
  screenSharing: ScreenSharingContext;
  canScreenshare: boolean;
}) => {
  const [playSurface, setPlaySurface] = useState<Optional<Mesh>>();
  const { raycaster } = useThree();

  const [mediaPath] = useState(() => toMediaPath(path));

  const mediaPath$ = useBehaviorSubjectFromCurrentValue(mediaPath);

  const playSurfaceConfig = useMemo(() => defaultSurfaceConfig(), []);

  const interactable$ = useBehaviorSubjectFromCurrentValue(interactable);

  const playSurface$ = useBehaviorSubjectFromCurrentValue(playSurface);

  const spaceId$ = useBehaviorSubjectFromCurrentValue(spaceId);

  const [hovering$] = useState(new BehaviorSubject<boolean>(false));

  const hovering = useCurrentValueFromBehaviorSubject(hovering$);

  const [audioAndVideo$] = useState(
    new BehaviorSubject<AudioAndVideoElement>({
      audio: null,
      video: null,
    })
  );

  const { audio } = useCurrentValueFromBehaviorSubject(audioAndVideo$);

  const pointerOverContext = useContext(PointerOverContext);

  const disableInteractivity$ = pointerOverContext?.disableInteractivity$;

  const canScreenshare$ = useBehaviorSubjectFromCurrentValue(canScreenshare);

  useEffect(() => {
    const sub = combineLatest([
      audioAndVideo$.pipe(pluck("video")),
      disableInteractivity$ || from([false]),
      canScreenshare$,
      interactable$,
      playSurface$,
    ])
      .pipe(
        switchMap(
          ([
            playingVideo,
            disableInteractivity,
            canScreenshare,
            interactable,
            playSurface,
          ]) => {
            if (
              !canScreenshare ||
              playingVideo ||
              disableInteractivity ||
              !interactable ||
              !playSurface
            ) {
              return from([false]);
            }

            return interval(hoverCheckDuration).pipe(
              map(() => {
                const intersections = raycaster.intersectObject(
                  playSurface,
                  true
                );

                const hovering = intersections.length > 0;
                return hovering;
              })
            );
          }
        ),
        distinctUntilChanged()
      )
      .subscribe(hovering$);

    return () => sub.unsubscribe();
  }, [
    audioAndVideo$,
    disableInteractivity$,
    hovering$,
    interactable$,
    playSurface$,
    raycaster,
    canScreenshare$,
  ]);

  const [complete$] = useState(new Subject<void>());

  useEffect(() => {
    return () => {
      // on unmount, make sure to close all requests
      complete$.next();
      complete$.complete();
    };
  }, [complete$]);

  const { capture, sharing$, videoElement$ } = screenSharing;

  useEffect(() => {
    const clicks$ = fromEvent(document, "click").pipe(
      withLatestFrom(hovering$),
      map(([, hovering]) => hovering),
      filter((hovering) => hovering)
    ) as Observable<true>;

    const sub = captureOrReceiveScreenShare({
      sessionPaths$,
      mediaPath$,
      spaceId$,
      activeSessions$,
      consumers$,
      clickedToPlay$: clicks$,
      capture,
      sharing$,
      videoElement$,
      complete$,
    }).subscribe(audioAndVideo$);

    return () => sub.unsubscribe();
  }, [
    activeSessions$,
    audioAndVideo$,
    capture,
    consumers$,
    hovering$,
    mediaPath$,
    sessionPaths$,
    sharing$,
    spaceId$,
    videoElement$,
    complete$,
  ]);

  const screenSize = useMemo(
    () => videoSizeFromAspect({ aspect: values.aspect }),
    [values.aspect]
  );

  const [playingVideoAndSize$] = useState(
    new BehaviorSubject<
      { width: number; height: number; video: HTMLVideoElement } | undefined
    >(undefined)
  );

  const playingVideoAndSize = useCurrentValueFromObservable(
    playingVideoAndSize$,
    undefined
  );

  const screenSize$ = useBehaviorSubjectFromCurrentValue(screenSize);

  useEffect(() => {
    const videoElement$ = audioAndVideo$.pipe(
      pluck("video"),
      distinctUntilChanged()
    );

    videoElement$
      .pipe(
        switchMap((videoElement) => {
          if (!videoElement) return from([undefined]);

          const videoSize$ = observeVideoSize(videoElement);

          const videoScreenSize$ = combineLatest([
            videoSize$,
            screenSize$,
          ]).pipe(
            map(([videoSize, screenSize]) =>
              computeVideoSize({ videoSize, screenSize })
            )
          );

          return videoScreenSize$.pipe(
            map((videoScreenSize) => ({
              video: videoElement,
              ...videoScreenSize,
            }))
          );
        })
      )
      .subscribe(playingVideoAndSize$);
  }, [audioAndVideo$, playingVideoAndSize$, screenSize$]);

  const [groupRef, setGroupRef] = useState<Optional<Object3D>>();

  const texture = useVideoTexture({ video: playingVideoAndSize?.video });

  return (
    <group ref={setGroupRef}>
      {playingVideoAndSize && texture && (
        <PlaySurface
          config={playSurfaceConfig}
          texture={texture}
          planeDimensions={playingVideoAndSize}
          legacyRotation={values.legacyRotation}
        />
      )}
      {audio && listener && groupRef && (
        <AudioSoundAdjuster
          listener={listener}
          play={true}
          soundConfig={screenSharePositionalAudioConfig}
          mediaElement={audio}
          spatialAudioEnabled={false}
          parentElement={groupRef}
        />
      )}
      {!playingVideoAndSize && (
        <NonPlayingPlaySurface
          config={playSurfaceConfig}
          videoHeight={screenSize.height}
          videoWidth={screenSize.width}
          setMesh={setPlaySurface}
          hovering={hovering}
          legacyRotation={values.legacyRotation}
        />
      )}
    </group>
  );
};

const ScreenShareWrapper = ({
  config,
  path,
}: {
  config?: ScreenShareConfig;
  path: string[];
}) => {
  const values = useConfigOrDefault(config, defaultScreenShareConfig);

  const spaceContext = useContext(SpaceContext);

  const listener = useCurrentValueFromObservable(
    spaceContext?.listener$,
    undefined
  );

  if (!spaceContext) return null;

  const {
    sessionPaths$,
    consumers$,
    activeSessions$,
    spaceId,
    interactable,
    screenSharing,
    canEdit,
  } = spaceContext;

  const canScreenshare = !!values.guestsCanScreenShare || !!canEdit;

  if (
    !spaceId ||
    !sessionPaths$ ||
    !consumers$ ||
    !activeSessions$ ||
    !screenSharing
  )
    return null;

  return (
    <ScreenShare
      values={values}
      listener={listener}
      path={path}
      spaceId={spaceId}
      interactable={interactable}
      sessionPaths$={sessionPaths$}
      consumers$={consumers$}
      activeSessions$={activeSessions$}
      screenSharing={screenSharing}
      canScreenshare={canScreenshare}
    />
  );
};

export default ScreenShareWrapper;
