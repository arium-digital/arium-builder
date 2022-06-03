import { useState, useEffect } from "react";
import {
  ObservedConsumersOfPeer,
  AggregateObservedConsumers,
  ObservedConsumer,
} from "communicationTypes";
import { MediaKind } from "mediasoup-client/lib/types";
import { consumersDb, store } from "db";
import * as mediasoupClient from "mediasoup-client";
import { MediaTrackKind } from "../../../../shared/communication";
import { SessionPaths } from "shared/dbPaths";
import {
  BehaviorSubject,
  combineLatest,
  from,
  merge,
  Observable,
  Subject,
} from "rxjs";
import {
  mergeMap,
  switchMap,
  groupBy,
  map,
  retryWhen,
  delay,
  take,
  scan,
  tap,
  filter,
} from "rxjs/operators";
import { useTakeUntilUnmount } from "../../../hooks/useObservable";
import { filterUndefined } from "../../../libs/rx";
import debug from "debug";
import { ServerConsumerInfo } from "../../../../shared/sharedTypes";

const observeConsumersCreatedOnServer = (
  sessionPaths: SessionPaths
): Observable<ServerConsumerInfo> => {
  return new Observable<ServerConsumerInfo>((subscribe) => {
    const ref = sessionPaths
      .communicatonCollection()
      .doc("consumers")
      .collection("created");

    const unsub = ref.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const val = change.doc.data();

          const consumerInfo = val as ServerConsumerInfo;

          subscribe.next(consumerInfo);
        }
      });
    });

    return () => {
      unsub();
    };
  });
};

const observeDeletedConsumers = (
  sessionPaths: SessionPaths
): Observable<ServerConsumerInfo> => {
  return new Observable<ServerConsumerInfo>((subscribe) => {
    const { userId, sessionId } = sessionPaths;
    const ref = store
      .collection("communication")
      .doc(userId)
      .collection("session")
      .doc(sessionId)
      .collection("consumers");

    const unsub = ref.onSnapshot((snapshot) => {
      // todo: delete consumers
    });
    //   const val = snapshot.val();

    //   const deletedConsumer = val as ServerConsumerInfo;

    //   subscribe.next(deletedConsumer);
    // });

    return () => {
      unsub();
    };
  });
};

const observeConsumerPaused = ({
  consumerId,
  sessionPaths,
}: {
  consumerId: string;
  sessionPaths: SessionPaths;
}) => {
  return new Observable<boolean>((subscribe) => {
    const ref = consumersDb.ref(
      sessionPaths.serverConsumerPaused({ consumerId })
    );

    ref.on("value", (snapshot) => {
      const paused = snapshot.val() as boolean;

      if (typeof paused === "boolean") subscribe.next(paused);
    });

    return () => {
      ref.off("value");
    };
  });
};

export const createMediaElementForStream = ({
  stream,
  mute,
}: {
  stream: MediaStream;
  mute: boolean;
}): HTMLVideoElement => {
  const element = document.createElement("video");
  // @ts-ignore
  element.setAttribute("playsinline", true);
  element.setAttribute("autoplay", "true");
  element.setAttribute("muted", "true");
  element.setAttribute("style", "display:none");
  // element.setAttribute("style", "z-index:1000");

  if (mute) {
    element.volume = 0;
  }

  document.body.appendChild(element);

  element.srcObject = stream;

  return element;
  // if (kind === "screenAudio" || kind === "webcamAudio")
  //   return {
  //     mediaElement: mediaElement as HTMLAudioElement,
  //     texture: undefined,
  //   };

  // return {
  //   mediaElement: mediaElement as HTMLVideoElement,
  //   texture: new VideoTexture(mediaElement as HTMLVideoElement),
  // };
};

export const createMediaElement = ({
  track,
  kind,
}: {
  track: MediaStreamTrack;
  kind: MediaTrackKind;
}): HTMLAudioElement | HTMLVideoElement => {
  const mediaKind: MediaKind = kind.toLowerCase().includes("audio")
    ? "audio"
    : "video";

  let mediaElement: HTMLAudioElement | HTMLVideoElement;

  if (mediaKind === "video") {
    const element = document.createElement("video");
    // @ts-ignore
    element.setAttribute("playsinline", true);
    element.setAttribute("autoplay", "true");
    element.setAttribute("muted", "true");
    element.setAttribute("style", "display:none");
    // element.setAttribute("style", "z-index:1000");

    mediaElement = element;
  } else {
    const element = document.createElement("audio");
    element.volume = 0;
    // element.volume = 1;
    // element.autoplay = true;

    mediaElement = element;
  }

  document.body.appendChild(mediaElement);

  mediaElement.srcObject = new MediaStream([track]);

  return mediaElement;
  // if (kind === "screenAudio" || kind === "webcamAudio")
  //   return {
  //     mediaElement: mediaElement as HTMLAudioElement,
  //     texture: undefined,
  //   };

  // return {
  //   mediaElement: mediaElement as HTMLVideoElement,
  //   texture: new VideoTexture(mediaElement as HTMLVideoElement),
  // };
};

export const pauseOrResume = (element: HTMLMediaElement, pause: boolean) => {
  if (pause) {
    debug("media")("paused");
    return from([element.pause()]);
  } else {
    // console.log("resuming");
    // return from(['hi']);
    return from(element.play()).pipe(
      // retry 3 times, with 1 second delay
      tap(() => debug("media")("resumed")),
      retryWhen((errors) =>
        errors.pipe(
          tap((error) => console.log("got error", error)),
          delay(1000),
          take(3)
        )
      )
    );
  }
};

const notifyConsuming = ({
  sessionPaths,
  consumerId,
}: {
  sessionPaths: SessionPaths;
  consumerId: string;
}) => {
  consumersDb.ref(sessionPaths.clientConsuming({ consumerId })).set(true);
};

const createConsumer = async ({
  consumerTransport,
  consumerCreatedOnServerInfo,
}: {
  consumerTransport: mediasoupClient.types.Transport;
  consumerCreatedOnServerInfo: ServerConsumerInfo;
}) => {
  const {
    consumerId,
    rtpParameters,
    kind,
    producerId,
  } = consumerCreatedOnServerInfo;

  const consumer = await consumerTransport.consume({
    id: consumerId,
    rtpParameters: rtpParameters,
    kind: kind,
    producerId: producerId,
  });

  return consumer;
};

export const useConsumers = ({
  enteredSpace$,
  sessionPaths$,
  consumerTransport$,
  consumers$,
}: {
  enteredSpace$: Observable<boolean>;
  sessionPaths$: Observable<SessionPaths | undefined>;
  consumers$: Subject<ObservedConsumer>;
  consumerTransport$: Observable<mediasoupClient.types.Transport | undefined>;
}) => {
  const takeUntilUnmount = useTakeUntilUnmount();

  const [aggregateConsumers$] = useState(
    new BehaviorSubject<AggregateObservedConsumers>({})
  );

  useEffect(() => {
    consumers$
      .pipe(
        scan(
          (
            acc: AggregateObservedConsumers,
            current
          ): AggregateObservedConsumers => {
            const {
              kind,
              producingSessionId,
              consumer,
              paused,
              mediaElement,
            } = current;

            const ofSession: ObservedConsumersOfPeer = {
              ...(acc[producingSessionId] || {}),
            };

            if (!consumer || !mediaElement) {
              // TODO: remove media element and track and stop it
              delete ofSession[kind];
            } else {
              ofSession[kind] = {
                paused,
                mediaElement,
                consumer,
              };
            }

            return {
              ...acc,
              [producingSessionId]: ofSession,
            };
          },
          {}
        ),
        takeUntilUnmount()
      )
      .subscribe(aggregateConsumers$);
  }, [aggregateConsumers$, consumers$, takeUntilUnmount]);

  useEffect(() => {
    combineLatest([
      consumerTransport$.pipe(filterUndefined()),
      sessionPaths$.pipe(filterUndefined()),
      // only start this when initialized
      enteredSpace$.pipe(
        filter((initialized) => initialized),
        delay(1000)
      ),
    ])
      .pipe(
        switchMap(([consumerTransport, sessionPaths]) => {
          const createdConsumers$ = observeConsumersCreatedOnServer(
            sessionPaths
          ).pipe(
            map((serverConsumer) => ({
              serverConsumer,
              change: "created",
            }))
          );
          const deletedConsumers$ = observeDeletedConsumers(sessionPaths).pipe(
            map((serverConsumer) => ({
              serverConsumer,
              change: "deleted",
            }))
          );

          return merge(createdConsumers$, deletedConsumers$).pipe(
            filterUndefined(),
            tap(({ change, serverConsumer }) =>
              debug(`consumer:server:${change}`)(serverConsumer)
            ),
            mergeMap(async ({ change, serverConsumer }) => {
              let consumer;
              let mediaElement;
              if (change === "created") {
                consumer = await createConsumer({
                  consumerTransport,
                  consumerCreatedOnServerInfo: serverConsumer,
                });
                notifyConsuming({
                  sessionPaths,
                  consumerId: consumer.id,
                });

                mediaElement = createMediaElement({
                  track: consumer.track,
                  kind: serverConsumer.mediaKind,
                });

                // if (mediaElement is HTMLVideoElement) {

                // }
              } else {
                mediaElement = null;
              }

              return {
                consumer,
                mediaElement,
                producingSessionId: serverConsumer.producingSessionId,
                kind: serverConsumer.mediaKind,
              };
            }),
            groupBy(
              ({ producingSessionId, kind }) => `${producingSessionId}-${kind}`
            ),
            mergeMap((consumersOfPeer$) =>
              consumersOfPeer$.pipe(
                switchMap(
                  ({ consumer, kind, producingSessionId, mediaElement }) => {
                    if (!consumer || !mediaElement) {
                      return from([
                        {
                          consumer: null,
                          mediaElement: null,
                          kind,
                          producingSessionId,
                          paused: true,
                        },
                      ]);
                    }
                    return observeConsumerPaused({
                      consumerId: consumer.id,
                      sessionPaths,
                    }).pipe(
                      tap((paused) =>
                        debug(`consumer:server:PauseChange`)({
                          paused,
                          producingSessionId,
                          kind,
                        })
                      ),
                      map((paused) => {
                        if (paused) {
                          consumer.pause();
                          mediaElement.pause();
                        } else {
                          consumer.resume();
                          mediaElement.play().catch((e) =>
                            setTimeout(() => {
                              // if fails to play, try again in 0.5 seconds
                              mediaElement.play();
                            }, 500)
                          );
                        }

                        const result: ObservedConsumer = {
                          consumer,
                          kind,
                          producingSessionId,
                          mediaElement,
                          paused,
                        };

                        return result;
                      })
                    );
                  }
                )
              )
            )
          );
        }),
        takeUntilUnmount()
      )
      .subscribe(consumers$);
  }, [
    consumerTransport$,
    consumers$,
    enteredSpace$,
    sessionPaths$,
    takeUntilUnmount,
  ]);

  return aggregateConsumers$;
};
