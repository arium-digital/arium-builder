import {
  BroadcastersAndAudioSettings,
  FilteredPeersWithDistance,
  PeerAndDistance,
} from "../../communicationTypes";
import { NumberDict, PeerPlayerPositions, PlayerLocation } from "../../types";
// import * as THREE from 'three';

export interface DistanceCalculations {
  distancesByPeer: NumberDict;
  allVisiblePeers: PeerAndDistance[];
  peersToHear: FilteredPeersWithDistance;
  peersToSee: FilteredPeersWithDistance;
}

export function toDistanceCalculations({
  playerState,
  activeSessions,
  peerPlayerStates,
  maxVisiblePeers,
  broadcastingPeers,
  projectionMatrix,
  maxPeersToSee,
  maxPeerstoHear,
}: {
  playerState: PlayerLocation;
  activeSessions: string[];
  peerPlayerStates: PeerPlayerPositions;
  maxVisiblePeers: number;
  broadcastingPeers: BroadcastersAndAudioSettings;
  projectionMatrix: number[];
  maxPeersToSee: number;
  maxPeerstoHear: number;
}): DistanceCalculations {
  function getDistanceByPeer() {
    function distanceSquared(
      a: [number, number, number],
      b: [number, number, number]
    ) {
      const sums = a.map((val, i) => Math.pow(val - b[i], 2));

      let total = 0;
      sums.forEach((sum) => {
        total += sum;
      });

      return total;
    }

    const byDistance: NumberDict = {};
    Object.entries(peerPlayerStates).forEach((peerPlayerState) => {
      const peerId = peerPlayerState[0];
      const peerPosition = peerPlayerState[1];
      if (activeSessions.includes(peerId)) {
        byDistance[peerId] = distanceSquared(
          playerState.position,
          peerPosition
        );
      }
    });

    return byDistance;
  }

  function getPeersSortedByDistance(
    peersAndDistances: NumberDict
  ): PeerAndDistance[] {
    const result = Object.entries(peersAndDistances);

    const sorted = result.sort((a, b) => a[1] - b[1]);

    return sorted.map((entry) => ({ id: entry[0], distance: entry[1] }));
  }

  function getPeersInCameraFulcrum() {
    // @ts-ignore
    const cameraMatrix = new THREE.Matrix4();
    cameraMatrix.elements = projectionMatrix;
    // @ts-ignore
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(cameraMatrix);

    const peersInFulcrum = Object.entries(peerPlayerStates)
      .filter((peerLocation) => {
        const peerPositionValues = peerLocation[1];
        // @ts-ignore
        const peerPosition = new THREE.Vector3(
          peerPositionValues[0],
          peerPositionValues[1],
          peerPositionValues[2]
        );

        const boxSize = 1;
        const min = peerPosition.clone().addScalar(-boxSize);
        const max = peerPosition.clone().addScalar(boxSize);

        // @ts-ignore
        const box = new THREE.Box3(min, max);

        return frustum.intersectsBox(box);
      })
      .map((peerLocation) => peerLocation[0]);

    return peersInFulcrum;
  }

  function getPeersToHear({
    distancesByPeer,
    peersSortedByDistance,
    max,
  }: {
    distancesByPeer: NumberDict;
    peersSortedByDistance: PeerAndDistance[];
    max: number;
  }): FilteredPeersWithDistance {
    const peersToShow = peersSortedByDistance.slice(0, maxVisiblePeers);

    const broadcastingPeerKeys = Object.keys(broadcastingPeers);

    if (broadcastingPeerKeys.length > 0) {
      const nearestPeerIds = peersToShow.map(({ id }) => id);
      Object.keys(broadcastingPeers).forEach((broadcastingPeerId) => {
        // if broadcasting peer already in nearest peers, dont add it
        if (nearestPeerIds.includes(broadcastingPeerId)) return;

        // if broadcasting peer not in nearest peers, add it
        const broadcasterDistance = distancesByPeer[broadcastingPeerId];
        if (broadcasterDistance)
          // add broadcaster to beginning, so that its always included in peers to show.
          peersToShow.unshift({
            id: broadcastingPeerId,
            distance: broadcasterDistance,
          });
      });
    }

    const filteredToMax = peersToShow.slice(0, max + 1);

    const indexedByPeer = filteredToMax.reduce(
      (acc: FilteredPeersWithDistance, current) => {
        acc[current.id] = current.distance;

        return acc;
      },
      {}
    );

    return indexedByPeer;
  }

  function getPeersToSee({
    distancesByPeer,
    peersSortedByDistance,
    max,
  }: {
    distancesByPeer: NumberDict;
    peersSortedByDistance: PeerAndDistance[];
    max: number;
  }) {
    const peersInFulcrum = getPeersInCameraFulcrum();

    const peersToShow = peersSortedByDistance
      .filter((peer) => peersInFulcrum.includes(peer.id))
      .slice(0, maxVisiblePeers);

    const broadcastingPeerKeys = Object.keys(broadcastingPeers);

    if (broadcastingPeerKeys.length > 0) {
      const nearestPeerIds = peersToShow.map(({ id }) => id);
      Object.keys(broadcastingPeers).forEach((broadcastingPeerId) => {
        // if braodcasting peer not in fulcrum, dont show it
        if (!peersInFulcrum.includes(broadcastingPeerId)) return;
        // if broadcasting peer already in nearest peers, dont add it
        if (nearestPeerIds.includes(broadcastingPeerId)) return;

        // if broadcasting peer not in nearest peers, add it
        const broadcasterDistance = distancesByPeer[broadcastingPeerId];
        if (broadcasterDistance)
          // add broadcaster to beginning, so that its always included in peers to show.
          peersToShow.unshift({
            id: broadcastingPeerId,
            distance: broadcasterDistance,
          });
      });
    }

    const filteredToMax = peersToShow.slice(0, max + 1);

    const indexedByPeer = filteredToMax.reduce(
      (acc: { [id: string]: number }, current) => {
        acc[current.id] = current.distance;

        return acc;
      },
      {}
    );

    return indexedByPeer;
  }

  const byDistance = getDistanceByPeer();
  const sortedPeersByDistance = getPeersSortedByDistance(byDistance);

  const peersToHear = getPeersToHear({
    distancesByPeer: byDistance,
    peersSortedByDistance: sortedPeersByDistance,
    max: maxPeerstoHear,
  });

  const peersToSee = getPeersToSee({
    distancesByPeer: byDistance,
    peersSortedByDistance: sortedPeersByDistance,
    max: maxPeersToSee,
  });

  // console.log(peersToSee, peersToHear);

  return {
    distancesByPeer: byDistance,
    allVisiblePeers: sortedPeersByDistance.slice(0, maxVisiblePeers),
    peersToHear,
    peersToSee: peersToSee,
  };
}

export default toDistanceCalculations;
