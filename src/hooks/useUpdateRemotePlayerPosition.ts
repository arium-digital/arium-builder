import { useEffect } from "react";
import { PlayerLocation } from "../types";
import { peersDb } from "../db";
import { arraysEqual } from "../libs/utils";
import { combineLatest, from, merge, Observable } from "rxjs";
import {
  bufferTime,
  distinctUntilChanged,
  map,
  switchMap,
} from "rxjs/operators";
import { filterUndefined } from "../libs/rx";

export const PLAYER_UPDATE_INTERVAL = 500;

export const defaultPlayerLocation: PlayerLocation = {
  position: [0, 0, 0],
  quarternion: [0, 0, 0, 0],
  lookAt: [100, 0, 0],
};

const useUpdateRemotePlayerLocation = ({
  spaceId$,
  userId$,
  sessionId$,
  invisible,
  enteredSpace$,
  playerLocation$,
}: {
  spaceId$: Observable<string | undefined>;
  userId$: Observable<string | undefined>;
  sessionId$: Observable<string | undefined>;
  invisible?: boolean;
  enteredSpace$: Observable<boolean>;
  playerLocation$: Observable<PlayerLocation>;
}) => {
  useEffect(() => {
    if (invisible) return;

    const sub = combineLatest([spaceId$, userId$, sessionId$, enteredSpace$])
      .pipe(
        switchMap(([spaceId, userId, sessionId, enteredSpace]) => {
          if (!spaceId || !userId || !sessionId || !enteredSpace)
            return from([undefined]);

          const positionsRef = peersDb.ref(
            `userPositions/${spaceId}/${sessionId}`
          );
          const quarternionsRef = peersDb.ref(
            `userRotations/${spaceId}/${sessionId}`
          );

          const playerLocationsBuffered$ = playerLocation$.pipe(
            bufferTime(PLAYER_UPDATE_INTERVAL),
            map((locations) => locations[locations.length - 1]),
            filterUndefined()
          );

          const positionUpdates$ = playerLocationsBuffered$.pipe(
            map(({ position }) => position),
            distinctUntilChanged(arraysEqual),
            map((position) => ({
              update: { position, userId },
              ref: positionsRef,
            }))
          );

          const quaternionUpdates$ = playerLocationsBuffered$.pipe(
            map(({ quarternion: rotation }) => rotation),
            distinctUntilChanged(arraysEqual),
            map((quaternion) => ({
              update: { quaternion, userId },
              ref: quarternionsRef,
            }))
          );

          return merge(positionUpdates$, quaternionUpdates$);
        })
      )
      .pipe(filterUndefined())
      .subscribe({
        next: ({ update, ref }) => {
          ref.set(update);
        },
      });

    return () => sub.unsubscribe();
  }, [
    enteredSpace$,
    invisible,
    playerLocation$,
    sessionId$,
    spaceId$,
    userId$,
  ]);
};

export default useUpdateRemotePlayerLocation;
