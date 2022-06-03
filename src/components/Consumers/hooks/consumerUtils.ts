import { Observable } from "rxjs";
import {
  map,
  scan,
  //   tap,
} from "rxjs/operators";
import { MediaTrackKind } from "../../../../shared/communication";
import { consumersDb } from "db";
import { SessionPaths } from "shared/dbPaths";

const setDifference = <T>(a: Set<T>, b: Set<T>) => {
  return Array.from(a.values()).filter((x) => !b.has(x));
};

const getChanges = (a = new Set<string>(), b = new Set<string>()) => {
  const toAdd = setDifference(a, b);
  const toRemove = setDifference(b, a);

  return {
    toAdd,
    toRemove,
  };
};

type Deltas = {
  [peerId: string]: boolean;
};

const getDeltas = (
  previousValidPeerIds: Set<string> = new Set<string>(),
  validPeerIds: Set<string>
): Deltas => {
  const deltas: Deltas = {};
  const { toAdd, toRemove } = getChanges(validPeerIds, previousValidPeerIds);

  toAdd.forEach((peerId) => {
    deltas[peerId] = true;
  });

  toRemove.forEach((peerId) => {
    deltas[peerId] = false;
  });

  return deltas;
};

export const toDeltas = (observable: Observable<Set<string>>) => {
  return observable.pipe(
    scan(
      (acc: { deltas: Deltas; existing: Set<string> }, currentPeersToPlay) => {
        return {
          deltas: getDeltas(acc.existing, currentPeersToPlay),
          existing: currentPeersToPlay,
        };
      },
      { existing: new Set<string>(), deltas: {} }
    ),
    map(({ deltas }) => deltas)
  );
};

export const updatePeersToConsume = ({
  sessionPaths,
  kind,
  peersToPlayChanges,
}: {
  sessionPaths: SessionPaths;
  kind: MediaTrackKind;
  peersToPlayChanges: Deltas;
}) => {
  consumersDb
    .ref(sessionPaths.peersToConsume({ kind }))
    .update(peersToPlayChanges);
};
