import * as mediasoupClient from "mediasoup-client";
import { useEffect, useState } from "react";
import { MediaTrackKind } from "../../../shared/communication";
import { BehaviorSubject, combineLatest, from, merge, Observable } from "rxjs";
import {
  MediaKind,
  Producer,
  ProducerCodecOptions,
  RtpCodecCapability,
  Transport,
} from "mediasoup-client/lib/types";
import {
  distinctUntilChanged,
  filter,
  take,
  map,
  mergeAll,
  mergeMap,
  pairwise,
  switchAll,
  switchMap,
  tap,
  ignoreElements,
  publishReplay,
  distinctUntilKeyChanged,
  first,
} from "rxjs/operators";
import { filterUndefined } from "../../libs/rx";
import {
  useBehaviorSubjectFromCurrentValue,
  useCurrentValueFromBehaviorSubject,
} from "../useObservable";
import { producingPeer, SessionPaths } from "../../shared/dbPaths";
import { communicationDb, producingPeersDb } from "../../db";
import debug from "debug";
import { setSuperPropertiesIfEnabled } from "analytics/init";
const debugProducer = (kind: string) => debug(`producer:${kind}`);

export interface TransportAndCanProduce {
  transport: mediasoupClient.types.Transport;
  canProduce: (kind: MediaKind) => boolean;
}

export const tryProduce = async ({
  transportAndCanProduce: { transport, canProduce },
  kind,
  track,
  codecOptions,
  codec,
}: {
  transportAndCanProduce: TransportAndCanProduce;
  track: MediaStreamTrack;
  kind: MediaTrackKind;
  codecOptions?: ProducerCodecOptions;
  codec?: RtpCodecCapability;
}) => {
  const mediaKind: mediasoupClient.types.MediaKind = [
    "screenAudio",
    "webcamAudio",
  ].includes(kind)
    ? "audio"
    : "video";

  if (!canProduce(mediaKind)) {
    debug(`producer:${kind}`)("cantProduce");
    return undefined;
  }

  debug(`producer:${kind}`)("startingToProduce");

  const producer = await transport.produce({
    track,
    appData: {
      kind,
    },
    stopTracks: false,
    codecOptions,
    codec,
  });

  debug(`producer:${kind}`)("created");

  return producer;
};

export const observeTransportsAndCreateProducer = ({
  producingTransport$,
  track$,
  kind,
}: {
  producingTransport$: Observable<TransportAndCanProduce | undefined>;
  track$: Observable<MediaStreamTrack | undefined>;
  kind: MediaTrackKind;
}) => {
  // or if the track changed, replace the track.
  // create methodology for observing the producer.
  const observable: Observable<{
    producer: Producer | undefined;
    track: MediaStreamTrack | undefined;
  }> = producingTransport$.pipe(
    filterUndefined(),
    map((transportAndCanProduce) => {
      debugProducer(kind)("got transport");
      const result = track$.pipe(
        filterUndefined(),
        take(1),
        mergeMap(async (track) => {
          try {
            return {
              producer: await tryProduce({
                transportAndCanProduce,
                kind,
                track,
              }),
              track,
            };
          } catch (e) {
            debugProducer(kind)("failed to produce");
            return undefined;
          }
        }),
        tap(() => {
          debugProducer(kind)("producer created");
        }),
        filterUndefined(),
        switchMap(({ producer, track }) => {
          return track$.pipe(
            map((currentTrack) => {
              // if track has changed, then replace the track in the producer.
              if (producer && currentTrack && currentTrack !== track) {
                producer.replaceTrack({ track: currentTrack });
              }

              return {
                producer,
                track: currentTrack,
              };
            })
          );
        })
      );

      return result;
    }),
    mergeAll()
  );

  return observable;
};

export type ProducerAndTrack =
  | {
      producer?: Producer;
      track?: MediaStreamTrack;
    }
  | undefined;

export type ProducerTransportObservable =
  | Observable<
      | {
          transport: Transport;
          canProduce: (kind: MediaKind) => boolean;
        }
      | undefined
    >
  | undefined;

export const useProducer = ({
  producingTransport$,
  track$,
  kind,
  enteredSpace$,
  sessionPaths$,
  spaceId$,
  userMediaPaused,
}: {
  producingTransport$: ProducerTransportObservable;
  track$: Observable<MediaStreamTrack | undefined>;
  kind: MediaTrackKind;
  enteredSpace$: Observable<boolean>;
  sessionPaths$: Observable<SessionPaths | undefined>;
  spaceId$: Observable<string>;
  userMediaPaused: boolean;
}) => {
  // const [
  //   producer,
  //   setProducer,
  // ] = useState<mediasoupClient.types.Producer | null>(null);

  const [producerAndTrack$] = useState(
    new BehaviorSubject<ProducerAndTrack>(undefined)
  );

  useEffect(() => {
    // legacy way of useState until we can switch over.
    if (!producingTransport$) return;

    // only return producer and track when user has entered the space and aggree to produce
    const sub = enteredSpace$
      .pipe(
        tap((produce) => {
          debugProducer(kind)("should produce update ", produce);
        }),
        map((produce) => {
          if (!produce) {
            // if should not produce - return empty observable;
            return from([undefined]);
          }
          return observeTransportsAndCreateProducer({
            producingTransport$,
            track$,
            kind,
          });
        }),
        switchAll()
      )
      .subscribe(producerAndTrack$);

    return () => sub.unsubscribe();
  }, [enteredSpace$, kind, producerAndTrack$, producingTransport$, track$]);

  useEffect(() => {
    // close previous producer when we get the next one.
    const sub = producerAndTrack$
      .pipe(
        filterUndefined(),
        map(({ producer }) => producer),
        distinctUntilChanged(),
        pairwise()
      )
      .subscribe({
        next: ([previous]) => {
          previous?.close();
        },
      });

    return () => {
      sub.unsubscribe();
    };
  }, [producerAndTrack$]);

  // convert toggle caused to pause or resume.  every other toggle
  // call means paused
  const [producerPaused$] = useState(new BehaviorSubject<boolean>(true));

  const paused = useCurrentValueFromBehaviorSubject(producerPaused$);

  const userMediaPaused$ = useBehaviorSubjectFromCurrentValue(userMediaPaused);

  useEffect(() => {
    // pause and enable/disable track if producer should be paused
    // when should be paused, pause producer and update
    // track enabled
    const sub = combineLatest([
      userMediaPaused$.pipe(distinctUntilChanged()),
      producerAndTrack$.pipe(filterUndefined()),
    ])
      .pipe(
        tap(([pause, { track, producer }]) => {
          debugProducer(kind)("paused update", {
            pause,
            producerExists: !!producer,
          });
        }),
        switchMap(async ([pause, { producer }]) => {
          if (producer) {
            if (!pause && producer.paused) {
              debugProducer("resuming producer");

              producer.resume();
            }
          }

          return pause;
        }),
        tap((paused) => {
          setSuperPropertiesIfEnabled({
            [`Sending ${kind}`]: !!paused,
          });
        })
      )
      .subscribe(producerPaused$);

    return () => sub.unsubscribe();
  }, [kind, producerAndTrack$, producerPaused$, userMediaPaused$]);

  const kind$ = useBehaviorSubjectFromCurrentValue(kind);

  // notify other clients in room of producing state
  useEffect(() => {
    const producerPausedRef$ = combineLatest([
      kind$.pipe(distinctUntilChanged()),
      sessionPaths$.pipe(filterUndefined(), distinctUntilChanged()),
      spaceId$.pipe(filterUndefined(), distinctUntilChanged()),
    ]).pipe(
      map(([kind, sessionPaths, spaceId]) => {
        const path = producingPeer({
          spaceId,
          kind,
          sessionId: sessionPaths.sessionId,
        });

        const ref = producingPeersDb.ref(path);

        return {
          ref,
          userId: sessionPaths.userId,
        };
      }),
      publishReplay(1, undefined, (ref$) => {
        const asPairs = ref$.pipe(
          pairwise(),
          tap(([last]) => {
            // remove last element on get new one
            last.ref.remove();
          }),
          ignoreElements()
        );

        return merge(asPairs, ref$);
      })
    );

    // notify other clients in room that producer is paused
    combineLatest([producerPaused$, producerPausedRef$])
      .pipe(
        map(([paused, { ref, userId }]) => {
          const key = `${paused}-${ref.key}-${userId}`;

          return {
            paused,
            ref,
            userId,
            key,
          };
        }),
        distinctUntilKeyChanged("key")
      )
      .subscribe({
        next: async ({ paused, ref, userId }) => {
          await ref.update({
            userId,
            paused,
          });

          ref.onDisconnect().remove();
        },
      });
  }, [kind$, producerPaused$, sessionPaths$, spaceId$]);

  // notify server when has not paused
  useEffect(() => {
    const producerHasPlayedOnce$ = producerPaused$.pipe(
      filter((paused) => !paused),
      first()
    );
    const sub = combineLatest([
      producerHasPlayedOnce$,
      producerAndTrack$.pipe(distinctUntilChanged()),
      sessionPaths$,
    ])
      .pipe(
        filter(([, producerAndTrackSubject, sessionPaths]) => {
          if (!producerAndTrackSubject || !sessionPaths) return false;
          if (!producerAndTrackSubject.producer) return false;
          return true;
        }),
        map(([paused, producerAndTrackSubject, sessionPaths]) => {
          // @ts-ignore
          const producerId = producerAndTrackSubject.producer.id;

          const pathToUpdate = sessionPaths?.clientProducerPaused({
            producerId,
          });
          return {
            paused,
            pathToUpdate,
            key: `${paused}-${pathToUpdate}`,
          };
        }),
        distinctUntilKeyChanged("key")
      )
      .subscribe({
        next: ({ paused, pathToUpdate: path }) => {
          // @ts-ignore
          communicationDb.ref(path).set({
            paused,
          });
        },
      });

    return () => sub.unsubscribe();
  }, [producerPaused$, producerAndTrack$, sessionPaths$]);

  return {
    paused,
  };
};
