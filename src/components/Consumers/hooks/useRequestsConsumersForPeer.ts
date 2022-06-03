import { FilteredPeersWithDistance } from "communicationTypes";
import { consumersDb } from "db";
import { useEffect } from "react";
import { combineLatest, from, Observable } from "rxjs";
import { distinctUntilChanged, map, switchMap } from "rxjs/operators";
import { SessionPaths } from "shared/dbPaths";
import { PeerConsumers } from "types";
import { MediaTrackKind } from "../../../../shared/communication";

function useRequestConsumersOfKindForPeer({
  peerId$,
  mediaTrackKind,
  peersThatShouldConsume$,
  producingPeers$,
  sessionPaths$,
}: {
  peerId$: Observable<string>;
  mediaTrackKind: MediaTrackKind;
  peersThatShouldConsume$: Observable<FilteredPeersWithDistance>;
  producingPeers$: Observable<Set<string>> | undefined;
  sessionPaths$: Observable<SessionPaths | undefined>;
}) {
  useEffect(() => {
    if (!producingPeers$) return;

    const shouldConsume$ = combineLatest([
      peerId$,
      peersThatShouldConsume$,
    ]).pipe(
      map(([peerId, peers]) => {
        return !!peers[peerId];
      }),
      distinctUntilChanged(),
      switchMap((shouldConsume) => {
        if (!shouldConsume || !producingPeers$) return from([false]);

        return combineLatest([peerId$, producingPeers$]).pipe(
          map(([peerId, producingPeers]) => {
            return producingPeers.has(peerId);
          })
        );
      }),
      distinctUntilChanged()
    );

    const sub = combineLatest([
      peerId$,
      shouldConsume$,
      sessionPaths$,
    ]).subscribe({
      next: ([peerId, shouldConsume, sessionPaths]) => {
        // if (mediaTrackKind === 'webcamVideo')
        //   console.log({ peerId, shouldConsume, mediaTrackKind });
        if (!sessionPaths) return;
        consumersDb
          .ref(sessionPaths.peerToConsume({ kind: mediaTrackKind, peerId }))
          .set(shouldConsume);
      },
    });

    // , producingPeers$]).pipe(map(([peerId, peersThatShouldConsume, producingPeers]) => {

    // }));

    return () => {
      sub.unsubscribe();
    };
  }, [
    mediaTrackKind,
    peerId$,
    peersThatShouldConsume$,
    producingPeers$,
    sessionPaths$,
  ]);
}

const useRequestConsumersForPeer = ({
  peerId$,
  peerConsumers,
  sessionPaths$,
}: {
  peerId$: Observable<string>;
  peerConsumers: PeerConsumers;
  sessionPaths$: Observable<SessionPaths | undefined>;
}) => {
  useRequestConsumersOfKindForPeer({
    mediaTrackKind: "webcamAudio",
    peersThatShouldConsume$: peerConsumers.peersToHear$,
    producingPeers$: peerConsumers.producingPeers.webcamAudio,
    peerId$,
    sessionPaths$,
  });
  useRequestConsumersOfKindForPeer({
    mediaTrackKind: "webcamVideo",
    peersThatShouldConsume$: peerConsumers.peersToSee$,
    producingPeers$: peerConsumers.producingPeers.webcamVideo,
    peerId$,
    sessionPaths$,
  });
};

export default useRequestConsumersForPeer;
