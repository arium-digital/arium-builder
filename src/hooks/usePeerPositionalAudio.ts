import { useEffect, useState } from "react";
import {
  BehaviorSubject,
  combineLatest,
  from,
  Observable,
  Subject,
} from "rxjs";
import {
  bufferTime,
  distinctUntilChanged,
  filter,
  groupBy,
  map,
  mergeMap,
  mergeScan,
  pluck,
  publish,
  scan,
  switchMap,
  tap,
} from "rxjs/operators";
import { spacePositionalAudioConfigDocument } from "shared/documentPaths";
import { AudioListener, PositionalAudio } from "three";
import { BroadcastersAndAudioSettings } from "../communicationTypes";
import { playOrPause } from "../Space/Peers/useStreamPlayer";
import { store } from "../db";

import { filterUndefined } from "../libs/rx";
import { PositionalAudioConfig } from "../spaceTypes";
import { NumberDict, PeerPlayerPositions } from "../types";
import {
  useBehaviorSubjectFromCurrentValue,
  useTakeUntilUnmount,
} from "./useObservable";
import { useObserveWorker } from "./useObserveWorker";

const clampToZeroOne = (value: number) => {
  return Math.min(Math.max(0, value), 1);
};

// const DEFAULT_ROLLOF_FACTOR = 2;
// const DEFAULT_REF_DISTANCE = 5;
// const DEFAULT_MAX_DISTANCE = 10000;
// const DEFAULT_DISTANCE_MODEL = "exponential";

export function getPositionalAudioVolume(
  distSquared: number,
  config?: PositionalAudioConfig
) {
  const distance = Math.sqrt(distSquared);
  const {
    maxDistance = 10000,
    distanceModel,
    rollOffFactor = 2,
    refDistance = 5,
    volume = 100,
    mode,
  } = config || {};

  const volumePercentage = volume / 100;

  if (mode === "global") return volumePercentage;

  if (distanceModel === "linear") {
    return (
      volumePercentage *
      clampToZeroOne(
        ((1 - rollOffFactor) * (distance - refDistance)) /
          (maxDistance - refDistance)
      )
    );
  } else {
    // for now ignore inverse; consider all others exponential
    return (
      volumePercentage *
      clampToZeroOne(
        Math.pow(Math.max(distance, refDistance) / refDistance, -rollOffFactor)
      )
    );
  }
}

const getPositionalAudioVolumes = (toGet: {
  [peerId: string]: {
    distance: number;
    playing: boolean;
    positionalAudioConfig: PositionalAudioConfig;
  };
}) => {
  function clampToZeroOne(value: number) {
    return Math.min(Math.max(0, value), 1);
  }

  function getPositionalAudioVolume(
    distSquared: number,
    config: PositionalAudioConfig
  ) {
    const distance = Math.sqrt(distSquared);
    const {
      maxDistance = 10000,
      distanceModel,
      rollOffFactor = 2,
      refDistance = 5,
    } = config;

    if (distanceModel === "linear") {
      return clampToZeroOne(
        ((1 - rollOffFactor) * (distance - refDistance)) /
          (maxDistance - refDistance)
      );
    } else {
      // for now ignore inverse; consider all others exponential
      return clampToZeroOne(
        Math.pow(Math.max(distance, refDistance) / refDistance, -rollOffFactor)
      );
    }
  }

  return Object.entries(toGet).reduce(
    (result: NumberDict, toGetEntry): NumberDict => {
      const peerId = toGetEntry[0];
      const { distance, playing, positionalAudioConfig } = toGetEntry[1];
      if (!playing) {
        result[peerId] = 0;
      } else {
        result[peerId] = getPositionalAudioVolume(
          distance,
          positionalAudioConfig
        );
      }

      return result;
    },
    {}
  );
};

const defaultPositionalAudioConfig: PositionalAudioConfig = {
  distanceModel: "exponential",
  maxDistance: 50,
  refDistance: 4,
  rollOffFactor: 4,
};

const singleConcurrent = 1;

const observePeerPositionalAudioConfig = ({
  peerId,
  broadcasters$,
  defaultPositionalAudioConfig$,
}: {
  peerId: string;
  broadcasters$: Observable<BroadcastersAndAudioSettings>;
  defaultPositionalAudioConfig$: Observable<PositionalAudioConfig>;
}) => {
  const positionalAudioConfigIfBroadcasting$ = broadcasters$.pipe(
    pluck(peerId),
    distinctUntilChanged()
  );

  const positionalAudioConfig$ = combineLatest([
    positionalAudioConfigIfBroadcasting$,
    defaultPositionalAudioConfig$,
  ]).pipe(
    map(
      ([broadcasterConfig, defaultPositionalAudioConfig]) =>
        broadcasterConfig || defaultPositionalAudioConfig
    )
  );

  return positionalAudioConfig$;
};

const adjustPositionalAudioFromConfig = (
  positionalAudio: PositionalAudio,
  soundConfig: PositionalAudioConfig
) => {
  positionalAudio.setRefDistance(soundConfig.refDistance || 5);
  positionalAudio.setRolloffFactor(soundConfig.rollOffFactor || 2);
  positionalAudio.setDistanceModel(soundConfig.distanceModel || "exponential");
  positionalAudio.setMaxDistance(soundConfig.maxDistance || 10000);
};

type ObservedConsumer = {
  srcObject: MediaStream;
  paused: boolean;
  mediaElement: HTMLMediaElement;
  producingSessionId: string;
};

const pauseOrResumeOrCreatePositionalAudio = (
  acc: { positionalAudio: PositionalAudio | undefined; playing: boolean },
  current: ObservedConsumer,
  listener: AudioListener
) => {
  const { positionalAudio, playing } = acc;
  if (positionalAudio) {
    if (current.paused && playing) {
      positionalAudio.pause();
    } else if (!current.paused && !playing) {
      positionalAudio.play();
    }
    return {
      positionalAudio,
      playing: !current.paused,
    };
  } else {
    if (current.paused || !current.mediaElement) {
      return acc;
    }

    const positionalAudio = new PositionalAudio(listener);

    positionalAudio.setMediaStreamSource(
      current.mediaElement.srcObject as MediaStream
    );
    positionalAudio.play();

    return {
      positionalAudio,
      playing: true,
    };
  }
};

const observePositionalAudioElement = ({
  consumerOfPeer$,
  positionalAudioConfig$,
  listener,
  peerPositions$,
  peerId,
}: {
  consumerOfPeer$: Observable<ObservedConsumer>;
  positionalAudioConfig$: Observable<PositionalAudioConfig>;
  listener: AudioListener;
  peerPositions$: Observable<PeerPlayerPositions>;
  peerId: string;
}) => {
  const positionalAudioElement$ = consumerOfPeer$.pipe(
    scan(
      (
        acc: {
          positionalAudio: PositionalAudio | undefined;
          playing: boolean;
        },
        current
      ) => {
        return pauseOrResumeOrCreatePositionalAudio(acc, current, listener);
      },
      { playing: false, positionalAudio: undefined }
    )
  );
  return positionalAudioElement$.pipe(
    switchMap(({ positionalAudio, playing }) => {
      if (!positionalAudio) return from([undefined]);
      if (playing) {
        const positionalAudioAdjusted$ = positionalAudioConfig$.pipe(
          distinctUntilChanged(),
          map((soundConfig) => {
            adjustPositionalAudioFromConfig(positionalAudio, soundConfig);
          })
        );

        return positionalAudioAdjusted$.pipe(
          switchMap(() => {
            const position$ = peerPositions$.pipe(
              pluck(peerId),
              filterUndefined(),
              distinctUntilChanged()
            );

            return position$.pipe(
              map((position) => {
                positionalAudio.position.set(...position);
                positionalAudio.updateMatrixWorld(true);
                return position;
              })
            );
          })
        );
      } else return from([undefined]);
    })
  );
};

const observeAndUpdatePositionalAudioForConsumer = ({
  peerId,
  consumerOfPeer$,
  distancesByPeer$,
  broadcasters$,
  peerPositions$,
  defaultPositionalAudioConfig$,
  distanceCalculationRequests$,
  spatialAudioEnabled$,
  listener$,
}: {
  peerId: string;
  consumerOfPeer$: Observable<ObservedConsumer>;
  distancesByPeer$: Observable<NumberDict>;
  peerPositions$: Observable<PeerPlayerPositions>;
  broadcasters$: Observable<BroadcastersAndAudioSettings>;
  defaultPositionalAudioConfig$: Observable<PositionalAudioConfig>;
  spatialAudioEnabled$: Observable<boolean>;
  distanceCalculationRequests$: Subject<{
    peerId: string;
    playing: boolean;
    peerDistance: number;
    positionalAudioConfig: PositionalAudioConfig;
  }>;
  listener$: Observable<THREE.AudioListener | undefined>;
}) => {
  return consumerOfPeer$.pipe(
    publish((consumerOfPeer$) => {
      const positionalAudioConfig$ = observePeerPositionalAudioConfig({
        peerId,
        broadcasters$,
        defaultPositionalAudioConfig$,
      });

      return spatialAudioEnabled$.pipe(
        switchMap((spatialAudioEnabled) => {
          if (!spatialAudioEnabled) {
            const playing$ = consumerOfPeer$.pipe(
              mergeScan(
                (acc: boolean, current) => {
                  if (!current.mediaElement) return from([false]);
                  return playOrPause({
                    element: current.mediaElement,
                    play: !current.paused,
                    playing: acc,
                  });
                },
                false,
                singleConcurrent
              ),
              distinctUntilChanged()
            );
            const peerDistance$ = distancesByPeer$.pipe(
              pluck(peerId),
              distinctUntilChanged()
            );

            return combineLatest([
              from([peerId]),
              playing$,
              peerDistance$,
              positionalAudioConfig$,
            ]).pipe(
              map(([peerId, playing, peerDistance, positionalAudioConfig]) => ({
                peerId,
                playing,
                peerDistance,
                positionalAudioConfig,
              })),
              tap((request) => distanceCalculationRequests$.next(request))
            );
          } else {
            return listener$.pipe(
              switchMap((listener) => {
                if (!listener) return from([undefined]);

                return observePositionalAudioElement({
                  consumerOfPeer$,
                  positionalAudioConfig$,
                  peerId,
                  peerPositions$,
                  listener,
                });
              })
            );
          }
        })
      );
    })
  );
};

const usePeerPositionalAudioSettings = (
  authenticated$: Observable<boolean>,
  spaceId$: Observable<string | undefined>
) => {
  const [defaultPositionalAudioConfig$] = useState(
    new BehaviorSubject<PositionalAudioConfig>(defaultPositionalAudioConfig)
  );

  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    const spacePositionalAudiConfig$ = combineLatest([
      authenticated$.pipe(filter((auth) => auth)),
      spaceId$.pipe(filterUndefined()),
    ])
      .pipe(
        switchMap(([, spaceId]) => {
          return new Observable<PositionalAudioConfig | null>((subscribe) => {
            const unsub = spacePositionalAudioConfigDocument(
              spaceId
            ).onSnapshot((snapshot) => {
              if (snapshot.exists) {
                subscribe.next(snapshot.data() as PositionalAudioConfig);
              } else {
                subscribe.next(null);
              }
            });

            return () => {
              unsub();
            };
          });
        })
      )
      .pipe(distinctUntilChanged());

    spacePositionalAudiConfig$
      .pipe(
        switchMap((config) => {
          if (config) return from([config]);

          return new Observable<PositionalAudioConfig>((subscribe) => {
            const unsub = store
              .collection("settings")
              .doc("defaultPositionalAudioConfig")
              .onSnapshot((snapshot) => {
                if (snapshot.exists) {
                  subscribe.next(snapshot.data() as PositionalAudioConfig);
                } else {
                  subscribe.next(defaultPositionalAudioConfig);
                }
              });

            return () => unsub();
          });
        })
      )
      .pipe(
        map((config) => ({
          ...defaultPositionalAudioConfig,
          ...(config || {}),
        })),
        takeUntilUnmount()
      )
      .subscribe(defaultPositionalAudioConfig$);
  }, [
    authenticated$,
    defaultPositionalAudioConfig$,
    spaceId$,
    takeUntilUnmount,
  ]);

  return defaultPositionalAudioConfig$;
};

const deps: string[] = [];

export const usePeerPositionalAudio = ({
  authenticated$,
  consumers$,
  distancesByPeer$,
  peerPositions$,
  broadcasters$,
  enableSpatialAudio,
  listener$,
  spaceId$,
}: {
  authenticated$: Observable<boolean>;
  consumers$: Observable<ObservedConsumer>;
  distancesByPeer$: Observable<NumberDict>;
  peerPositions$: Observable<PeerPlayerPositions>;
  broadcasters$: Observable<BroadcastersAndAudioSettings>;
  enableSpatialAudio: boolean;
  listener$: Observable<AudioListener | undefined>;
  spaceId$: Observable<string | undefined>;
}) => {
  // const spatialAudioEnabled$ = useBehaviorSubjectFromCurrentValue(
  //   enableSpatialAudio
  // );
  const defaultPositionalAudioConfig$ = usePeerPositionalAudioSettings(
    authenticated$,
    spaceId$
  );

  const [volumeUpdatesByPeer$] = useState(new Subject<NumberDict>());

  const calculatePositionalAudioVolumesInWorker = useObserveWorker(
    getPositionalAudioVolumes,
    deps,
    volumeUpdatesByPeer$
  );

  const takeUntilUnmount = useTakeUntilUnmount();

  const [distanceCalculationRequests$] = useState(
    new Subject<{
      peerId: string;
      playing: boolean;
      peerDistance: number;
      positionalAudioConfig: PositionalAudioConfig;
    }>()
  );

  const spatialAudioEnabled$ = useBehaviorSubjectFromCurrentValue(
    enableSpatialAudio
  );

  useEffect(() => {
    consumers$
      .pipe(
        // filter((consumer) => consumer.kind === "webcamAudio"),
        groupBy((consumer) => consumer.producingSessionId),
        mergeMap((consumer$) => {
          const mediaElement$ = consumer$.pipe(
            map(({ mediaElement }) => mediaElement),
            distinctUntilChanged()
          );

          const peerId = consumer$.key;

          return mediaElement$.pipe(
            switchMap((element) => {
              if (!element) return from([undefined]);

              return volumeUpdatesByPeer$.pipe(
                pluck(peerId),
                filterUndefined(),
                distinctUntilChanged(),
                map((volume) => {
                  if (!isNaN(volume) && volume !== element.volume) {
                    element.volume = volume;
                  }

                  return element.volume;
                })
              );
            })
          );
        }),
        takeUntilUnmount()
      )
      .subscribe();

    consumers$
      .pipe(
        // filter((consumer) => consumer.kind === "webcamAudio"),
        groupBy((consumer) => consumer.producingSessionId)
      )
      .pipe(
        mergeMap((consumerOfPeer$) => {
          const peerId = consumerOfPeer$.key;

          return consumerOfPeer$.pipe(
            publish((consumerOfPeer$) => {
              return observeAndUpdatePositionalAudioForConsumer({
                peerId,
                consumerOfPeer$,
                distancesByPeer$,
                peerPositions$,
                broadcasters$,
                defaultPositionalAudioConfig$,
                distanceCalculationRequests$,
                spatialAudioEnabled$,
                listener$,
              });
            })
          );
        }),
        takeUntilUnmount()
      )
      .subscribe();

    distanceCalculationRequests$
      .pipe(
        bufferTime(250),
        filter((updates) => updates.length > 0),
        map((updates) => {
          const aggregateCall: {
            [peerId: string]: {
              distance: number;
              playing: boolean;
              positionalAudioConfig: PositionalAudioConfig;
            };
          } = {};

          updates.forEach(
            ({
              peerId,
              playing,
              peerDistance: distance,
              positionalAudioConfig,
            }) => {
              aggregateCall[peerId] = {
                playing,
                distance,
                positionalAudioConfig,
              };
            }
          );

          // set calculation to the worker.
          return aggregateCall;
        }),
        takeUntilUnmount()
      )
      .subscribe({ next: calculatePositionalAudioVolumesInWorker });

    // ))

    // spatialAudioEnabled$.pipe(
    //   switchMap((spatialAudioEnabled$) => {
    //     if (!spatialAudioEnabled$) {
    //       return observeAndAdjustDistanceBasedVolume({
    //         consumers$,
    //         distancesByPeer$,
    //         broadcasters$,
    //       });
    //     }
    //     return observeAndSetPeerSpatialAudio({
    //         consumers$,
    //         peerPositions$,
    //         broadcasters$
    //     })
    //   })
    // ).subscribe();
  }, [
    broadcasters$,
    calculatePositionalAudioVolumesInWorker,
    consumers$,
    defaultPositionalAudioConfig$,
    distanceCalculationRequests$,
    distancesByPeer$,
    listener$,
    peerPositions$,
    spatialAudioEnabled$,
    takeUntilUnmount,
    volumeUpdatesByPeer$,
  ]);
};
