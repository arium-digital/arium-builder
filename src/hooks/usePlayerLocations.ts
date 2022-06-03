import { useContext, useEffect, useState } from "react";
import { BehaviorSubject, combineLatest, from, Observable } from "rxjs";
import { bufferTime, map, scan, switchMap } from "rxjs/operators";

import {
  BroadcastersAndAudioSettings,
  FilteredPeersWithDistance,
  VisiblePeers,
} from "../communicationTypes";
import { filterUndefined } from "../libs/rx";
import {
  NumberDict,
  PeerPlayerPositions,
  PeersSettings,
  PlayerLocation,
} from "../types";
import {
  useBehaviorSubjectFromCurrentValue,
  useTakeUntilUnmount,
} from "./useObservable";
import { observePeerPlayerPositions } from "../stateFromDb";
import * as THREE from "three";
import { useObserveWorker } from "./useObserveWorker";
import {
  DistanceCalculations,
  toDistanceCalculations,
} from "./libs/distanceCalculations";
import ThreeContext from "components/ThreeContext";

export const usePeerLocations = ({
  spaceId$,
  sessionId$,
  activeSessions$,
}: {
  spaceId$: Observable<string | undefined>;
  sessionId$: Observable<string | undefined>;
  activeSessions$: Observable<Set<string>>;
}): Observable<PeerPlayerPositions> => {
  const [userLocations$] = useState(
    new BehaviorSubject<PeerPlayerPositions>({})
  );
  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    combineLatest([spaceId$, sessionId$])
      .pipe(
        switchMap(([spaceId, sessionId]) => {
          if (!spaceId || !sessionId) return from([{}]);
          return observePeerPlayerPositions({
            spaceId,
            sessionId,
            activeSessions$,
          }).pipe(
            // apply updates
            scan((acc: PeerPlayerPositions, update) => {
              const result = {
                ...acc,
              };

              if (update.remove) {
                delete result[update.sessionId];
              } else {
                result[update.sessionId] = update.change;
              }

              return result;
            }, {})
          );
        }),
        bufferTime(updateInterval),
        map((updates) => lastElement(updates)),
        filterUndefined(),
        takeUntilUnmount()
      )
      .subscribe(userLocations$);
  }, [activeSessions$, sessionId$, spaceId$, takeUntilUnmount, userLocations$]);

  return userLocations$;
};

const updateInterval = 500;

const lastElement = <T>(elements: T[]) => elements[elements.length - 1];

const lookAtPoint = new THREE.Vector3();
const addPoint = new THREE.Vector3();
export function computeLookAt(
  position: [number, number, number],
  desiredRotation: [number, number, number, number]
) {
  lookAtPoint.set(position[0], position[1], position[2]);
  addPoint.set(desiredRotation[0], desiredRotation[1], desiredRotation[2]);
  lookAtPoint.add(addPoint);
  lookAtPoint.setY(position[1]);

  return lookAtPoint;
}

export const distanceSquared = (
  a: [number, number, number],
  b: [number, number, number]
) => {
  const sums = a.map((val, i) => Math.pow(val - b[i], 2));

  let total = 0;
  sums.forEach((sum) => {
    total += sum;
  });

  return total;
};

// gets peers sorted by distance, up to x max peers

const deps: string[] = [
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r125/three.min.js",
];

export const usePeerDistanceCalculations = ({
  playerLocation$,
  peerPositions$,
  activeSessions$,
  peersSettings$,
  broadcastingPeers$,
}: {
  playerLocation$: Observable<PlayerLocation>;
  peerPositions$: Observable<PeerPlayerPositions>;
  activeSessions$: Observable<Set<string>>;
  peersSettings$: Observable<PeersSettings>;
  broadcastingPeers$: Observable<BroadcastersAndAudioSettings>;
}) => {
  const [distanceAndPositionByPeer$] = useState(
    new BehaviorSubject<DistanceCalculations>({
      allVisiblePeers: [],
      distancesByPeer: {},
      peersToHear: {},
      peersToSee: {},
    })
  );

  const [distancesByPeer$] = useState(new BehaviorSubject<NumberDict>({}));
  const [allVisiblePeers$] = useState(new BehaviorSubject<VisiblePeers>([]));
  const [peersToHear$] = useState(
    new BehaviorSubject<FilteredPeersWithDistance>({})
  );
  const [peersToSee$] = useState(
    new BehaviorSubject<FilteredPeersWithDistance>({})
  );

  const takeUntilUnmount = useTakeUntilUnmount();

  const sendCalculateDistanceSquaredByPeerToWorker = useObserveWorker(
    toDistanceCalculations,
    deps,
    distanceAndPositionByPeer$
  );

  const camera = useContext(ThreeContext)?.three?.camera;

  const camera$ = useBehaviorSubjectFromCurrentValue(camera);

  useEffect(() => {
    const sub = distanceAndPositionByPeer$.subscribe({
      next: ({ distancesByPeer, allVisiblePeers, peersToHear, peersToSee }) => {
        distancesByPeer$.next(distancesByPeer);
        allVisiblePeers$.next(allVisiblePeers);
        peersToHear$.next(peersToHear);
        peersToSee$.next(peersToSee);
      },
    });

    combineLatest([
      peerPositions$,
      activeSessions$,
      playerLocation$,
      broadcastingPeers$,
      peersSettings$,
      camera$,
    ])
      .pipe(
        bufferTime(250),
        map((entries) => entries[entries.length - 1]),
        filterUndefined(),
        takeUntilUnmount()
      )
      .subscribe({
        next: ([
          userLocations,
          activeSessions,
          playerLocation,
          broadcastingPeers,
          peersSettings,
          camera,
        ]) => {
          if (!camera) return;
          const {
            maxVisiblePeers = 150,
            maxAudioPeers = 12,
            maxVideoPeers = 12,
          } = peersSettings;

          const frustum = new THREE.Frustum();
          try {
            const clonedCamera = camera.clone() as THREE.PerspectiveCamera;
            // make the camera focal wider - so that many people are picked up.
            clonedCamera.setFocalLength(clonedCamera.getFocalLength() * 0.8);
            const projectionMatrix = new THREE.Matrix4().multiplyMatrices(
              clonedCamera.projectionMatrix,
              clonedCamera.matrixWorldInverse
            );
            frustum.setFromProjectionMatrix(projectionMatrix);

            sendCalculateDistanceSquaredByPeerToWorker({
              playerState: playerLocation,
              activeSessions: Array.from(activeSessions.values()),
              peerPlayerStates: userLocations,
              broadcastingPeers,
              maxVisiblePeers,
              projectionMatrix: projectionMatrix.elements,
              maxPeersToSee: maxVideoPeers,
              maxPeerstoHear: maxAudioPeers,
            });
          } catch (e) {
            console.error(e);
          }
        },
      });

    return () => {
      sub.unsubscribe();
    };
  }, [
    activeSessions$,
    allVisiblePeers$,
    broadcastingPeers$,
    camera$,
    distanceAndPositionByPeer$,
    distancesByPeer$,
    peerPositions$,
    peersSettings$,
    peersToHear$,
    peersToSee$,
    playerLocation$,
    sendCalculateDistanceSquaredByPeerToWorker,
    takeUntilUnmount,
  ]);

  return {
    distancesByPeer$,
    allVisiblePeers$,
    peersToHear$,
    peersToSee$,
  };
};
