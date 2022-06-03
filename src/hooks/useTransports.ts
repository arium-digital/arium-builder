import { useEffect, useMemo, useState } from "react";
import {
  TransportsObservables,
  WebRtcTransportInfo,
} from "../communicationTypes";
import { communicationDb, store } from "../db";
import { Observable, combineLatest, BehaviorSubject, from } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  pairwise,
  switchMap,
  tap,
} from "rxjs/operators";
import {
  MediaKind,
  RtpCapabilities,
  Device,
  TransportOptions,
} from "mediasoup-client/lib/types";
import {
  WebRtcTransportKind,
  WebRtcConnectionResult,
} from "../../shared/dbTypes";
import { ClientProducingResult } from "../../shared/sharedTypes";

import { TransportInfo } from "../../shared/sharedTypes";
import { SessionPaths } from "../shared/dbPaths";

import * as mediasoupClient from "mediasoup-client";
import { filterUndefined } from "../libs/rx";
import { useTakeUntilUnmount } from "./useObservable";
import { MediaTrackKind } from "../../shared/communication";
import debug from "debug";
const debugTransport = (kind: string) => debug(`transport:${kind}`);

const buildMediasoupDevice = (): mediasoupClient.Device => {
  // todo: investigate this commented out code which was there from before:
  // const urlParser = new UrlParse(window.location.href, true);
  // const handler = urlParser.query
  //   .handler as mediasoupClient.types.BuiltinHandlerName
  return new mediasoupClient.Device({});
};

const notifyClientTransportConnected = ({
  transportId,
  dtlsParameters,
  sessionPaths,
}: {
  transportId: string;
  dtlsParameters: any;
  sessionPaths: SessionPaths;
}) => {
  const result: WebRtcConnectionResult = {
    dtlsParameters,
  };
  communicationDb
    .ref(sessionPaths.clientWebRtcTransportConnected({ transportId }))
    .set(result);
};

const onServerTransportConnected = ({
  transportId,
  sessionPaths,
}: {
  transportId: string;
  sessionPaths: SessionPaths;
}) => {
  return new Promise((resolve, reject) => {
    communicationDb
      .ref(sessionPaths.serverWebRtcTransportConnected({ transportId }))
      .on("value", resolve);
  });
};

const performHandshakeOnConnect = ({
  transport,
  transportId,
  sessionPaths,
  kind,
}: {
  transport: mediasoupClient.types.Transport;
  transportId: string;
  sessionPaths: SessionPaths;
  kind: WebRtcTransportKind;
}) => {
  // promise that:
  // when the client transport connects, notifies the server transport
  // the server transport will connect, and when thats done, calls back
  // on the transport's connect method.
  // this promise resolves when the handshake is complete.
  return new Promise(async (resolve) => {
    // console.log("invoking promise to connect");
    transport.on(
      "connect",
      (
        { dtlsParameters },
        callback,
        errback // eslint-disable-line no-shadow
      ) => {
        // console.log("notifying of connected");
        notifyClientTransportConnected({
          transportId,
          dtlsParameters,
          sessionPaths,
        });

        onServerTransportConnected({
          transportId,
          sessionPaths,
        }).then(() => {
          debug("transport:serverConnected")({ transportId, kind });
          callback();

          resolve(null);
        });
      }
    );
  });
};

const notifyClientProducing = ({
  transportId,
  kind,
  rtpParameters,
  sessionPaths,
}: {
  transportId: string;
  kind: MediaTrackKind;
  rtpParameters: any;
  sessionPaths: SessionPaths;
}) => {
  const ref = sessionPaths
    .communicatonCollection()
    .doc(`clientProducing-${transportId}`);

  const entry: ClientProducingResult = {
    kind,
    rtpParameters,
  };

  ref.set(entry);
};

const onServerProducing = ({
  transportId,
  sessionPaths,
  kind,
}: {
  transportId: string;
  sessionPaths: SessionPaths;
  kind: MediaTrackKind;
}) => {
  // TODO: cleanup (through observable?)
  return new Promise<{ producerId: string }>((resolve, reject) => {
    const ref = communicationDb.ref(
      sessionPaths.serverProducing({ transportId, kind })
    );
    ref.on("value", (snapshot) => {
      const data = snapshot.val();
      // console.log("got data from server", data);
      if (data) {
        resolve(data);
        ref.off("value");
      }
    });
  });
};

const performHandshakeOnProduce = ({
  transport,
  sessionPaths,
}: {
  transport: mediasoupClient.types.Transport;
  sessionPaths: SessionPaths;
}) => {
  // console.log("waiting for producer handshake");
  transport.on(
    "produce",
    async ({ rtpParameters, appData }, callback, errback) => {
      try {
        // console.log("starting producer handshake");

        const kind = appData.kind as MediaTrackKind;

        // notify server of producing.
        notifyClientProducing({
          transportId: transport.id,
          kind,
          rtpParameters,
          sessionPaths,
        });

        // wait for server to produce, and get producer id back.
        const result = await onServerProducing({
          sessionPaths,
          transportId: transport.id,
          kind,
        });

        // console.log("got producer id result", result);

        callback({ id: result.producerId });
      } catch (error) {
        errback(error);
      }
    }
  );
};

const observeSessionServerTransports = (sessionPaths: SessionPaths) => {
  const serverWebRtcTransportsInfoRef = communicationDb.ref(
    sessionPaths.webRtcTransport()
  );
  return new Observable<{
    kind: WebRtcTransportKind;
    transportInfo: TransportInfo;
  }>((subscriber) => {
    // todo: cleanup
    serverWebRtcTransportsInfoRef.on("child_added", (snapshot) => {
      const kind = snapshot.key as WebRtcTransportKind;
      const transport = snapshot.val() as TransportInfo;

      // console.log("got transport info", kind);

      subscriber.next({ kind, transportInfo: transport });
    });

    return () => {
      serverWebRtcTransportsInfoRef.off("child_added");
    };
  });
};

const observeServerWebRtcTransportCreated = (
  sessionPaths: SessionPaths
): Observable<{
  kind: WebRtcTransportKind;
  transportInfo: TransportInfo;
}> => {
  return observeSessionServerTransports(sessionPaths);
};

const observeRouterRtpCapabilities = (routerId: string) => {
  const ref = store.collection("routerRtpCapabilities").doc(routerId);

  const observable = new Observable<RtpCapabilities>((subscriber) => {
    // TODO: cleanup
    const unsub = ref.onSnapshot((snapshot) => {
      const data = snapshot.data() as RtpCapabilities;

      if (data) {
        subscriber.next(data);
      }
    });

    return function unsubscribe() {
      unsub();
    };
  });

  return observable;
};

const debugDevice = (message: string) => debug(`device:${message}`);

const createAndObserveMediasoupDevice = (
  routerId$: Observable<string | undefined>
): Observable<Device | undefined> => {
  const mediaSoupDeviceObservable = routerId$.pipe(
    distinctUntilChanged(),
    // skip session paths that are not null
    switchMap((routerId: string | undefined) => {
      if (!routerId) return from([undefined]);
      return observeRouterRtpCapabilities(routerId).pipe(
        // only subscribe to the most recent observer.  when previous one
        // get new session id, this will unsubscribe from the previous one.
        // build and load mediasoup device when get new rtp capabilities.
        tap((rtpCapabilities) =>
          debugDevice("rtp capabilities from server:")(rtpCapabilities)
        ),
        mergeMap(async (rtpCapabilities) => {
          let mediasoupDevice: mediasoupClient.Device | undefined;
          try {
            mediasoupDevice = buildMediasoupDevice();
          } catch (e: any) {
            console.error(
              `failed creating media device with error: ${e?.toString()}. User agent: ${
                navigator.userAgent
              }`
            );
          }

          if (mediasoupDevice) {
            if (rtpCapabilities.headerExtensions)
              // filter out rotate camera, as it's not supported in all browser
              rtpCapabilities.headerExtensions = rtpCapabilities.headerExtensions.filter(
                (ext) => ext.uri !== "urn:3gpp:video-orientation"
              );

            await mediasoupDevice.load({
              routerRtpCapabilities: rtpCapabilities,
            });

            return mediasoupDevice;
          }
        }),
        tap(() => debugDevice("loaded")({}))
      );
    })
  );

  return mediaSoupDeviceObservable;
};

const createAndObserveTransports = ({
  sessionPaths,
  mediasoupDevice$,
}: {
  sessionPaths: Observable<SessionPaths | undefined>;
  mediasoupDevice$: Observable<mediasoupClient.Device | undefined>;
}): Observable<WebRtcTransportInfo | undefined> => {
  return mediasoupDevice$.pipe(
    switchMap((device) => {
      if (!device) return from([undefined]);
      return sessionPaths.pipe(
        filterUndefined(),
        switchMap((sessionPaths) =>
          observeServerWebRtcTransportCreated(sessionPaths).pipe(
            map((serverTransport) => ({
              serverTransport,
              device,
              sessionPaths,
            }))
          )
        ),
        tap((combined) => {
          debugTransport(combined.serverTransport.kind)("created on server");
        }),
        // for each server web rtc tranport created, combine with latest
        // mediasoup device and create a transport for it.
        map((combined) => {
          const {
            serverTransport: { kind, transportInfo },
            device,
            sessionPaths,
          } = combined;

          let transport: mediasoupClient.types.Transport;

          const options: TransportOptions = {
            ...transportInfo,
            // @ts-ignore
            iceCandidates: transportInfo.iceCandidates,
            iceServers: [],
          };

          if (kind === "consuming") {
            transport = device.createRecvTransport(options);
          } else {
            //             console.log('creating transport, info is', transportInfo);
            //             const PC_PROPRIETARY_CONSTRAINTS = {
            //   optional: [{ googDscp: true }],
            // };

            transport = device.createSendTransport({
              ...options,
              //  proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS
            });
          }

          return {
            transport,
            kind: kind,
            transportId: transportInfo.id,
            device,
            sessionPaths,
          };
        }),
        tap((transportInfo) => {
          const { transport, transportId, sessionPaths, kind } = transportInfo;
          performHandshakeOnConnect({
            transport,
            transportId,
            sessionPaths,
            kind,
          }).then(() => {
            debugTransport(kind)("server connected");
          });

          if (kind === "producing") {
            performHandshakeOnProduce({ transport, sessionPaths });
          }
        })
      );
    })
  );
};

const updateServerWithClientRtpCapabilities = (
  rtpCapabilities: RtpCapabilities,
  sessionPaths: SessionPaths
) => {
  sessionPaths
    .communicatonCollection()
    .doc("clientRtpCapabilities")
    .set(rtpCapabilities);
};

export const useTransports = ({
  routerId$,
  sessionPaths$,
}: {
  routerId$: Observable<string | undefined>;
  sessionPaths$: Observable<SessionPaths | undefined>;
}): TransportsObservables => {
  const [transports$] = useState(
    new BehaviorSubject<WebRtcTransportInfo | undefined>(undefined)
  );

  const [producerTransport$] = useState(
    new BehaviorSubject<
      | {
          transport: mediasoupClient.types.Transport;
          canProduce: (kind: MediaKind) => boolean;
        }
      | undefined
    >(undefined)
  );

  const [consumerTransport$] = useState(
    new BehaviorSubject<mediasoupClient.types.Transport | undefined>(undefined)
  );

  const takeUntilUnmount = useTakeUntilUnmount();

  const [mediasoupDevice$] = useState(
    new BehaviorSubject<Device | undefined>(undefined)
  );

  useEffect(() => {
    createAndObserveMediasoupDevice(routerId$)
      .pipe(takeUntilUnmount())
      .subscribe(mediasoupDevice$);
  }, [mediasoupDevice$, routerId$, takeUntilUnmount]);

  useEffect(() => {
    combineLatest([
      mediasoupDevice$.pipe(filterUndefined()),
      sessionPaths$.pipe(filterUndefined()),
    ])
      .pipe(takeUntilUnmount())
      .subscribe({
        next: ([device, sessionPaths]) => {
          updateServerWithClientRtpCapabilities(
            device.rtpCapabilities,
            sessionPaths
          );
        },
      });
  }, [mediasoupDevice$, sessionPaths$, takeUntilUnmount]);

  useEffect(() => {
    // subscribe to an observer that using the mediasoup device
    // creates consuming and producing transports for the user.
    createAndObserveTransports({
      mediasoupDevice$,
      sessionPaths: sessionPaths$,
    })
      .pipe(
        takeUntilUnmount(),
        tap((x) => {
          if (x) debugTransport(x.kind || "")("created");
        })
      )
      .subscribe(transports$);
  }, [sessionPaths$, transports$, takeUntilUnmount, mediasoupDevice$]);

  useEffect(() => {
    transports$
      .pipe(
        takeUntilUnmount(),
        filterUndefined(),
        filter(({ kind }) => kind === "consuming"),
        map(({ transport }) => transport)
      )
      .subscribe(consumerTransport$);
  }, [consumerTransport$, takeUntilUnmount, transports$]);

  useEffect(() => {
    transports$
      .pipe(
        takeUntilUnmount(),
        filterUndefined(),
        filter(({ kind }) => kind === "producing"),
        map(({ transport, device }) => ({
          transport,
          canProduce: (kind: MediaKind) => device.canProduce(kind),
        }))
      )
      .subscribe(producerTransport$);
  }, [producerTransport$, takeUntilUnmount, transports$]);

  useEffect(() => {
    consumerTransport$.pipe(pairwise(), takeUntilUnmount()).subscribe({
      next: ([previous]) => {
        // close previous consuming transport when get next one
        if (previous) {
          debug("transport:consumer:close")({});
          previous.close();
        }
      },
    });
  }, [consumerTransport$, takeUntilUnmount]);

  useEffect(() => {
    producerTransport$.pipe(pairwise(), takeUntilUnmount()).subscribe({
      next: ([previous]) => {
        if (previous) {
          debug("transport:producer:close")({});
          previous.transport.close();
        }
      },
    });
  }, [producerTransport$, takeUntilUnmount]);

  const allTransports$ = useMemo(
    () => ({
      producer: producerTransport$,
      consumer: consumerTransport$,
    }),
    [producerTransport$, consumerTransport$]
  );

  return allTransports$;
};
