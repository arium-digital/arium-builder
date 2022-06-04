import { useState, useEffect } from "react";
import { fromEvent, of, merge, timer, BehaviorSubject } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  groupBy,
  map,
  mapTo,
  mergeMap,
  scan,
  switchMap,
} from "rxjs/operators";
import { filterUndefined } from "libs/rx";

export interface Move {
  left: boolean;
  right: boolean;
  forward: boolean;
  backward: boolean;
  sprint: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  jump: boolean;
}

export const defaultMove: Move = {
  left: false,
  right: false,
  forward: false,
  backward: false,
  sprint: false,
  turnLeft: false,
  turnRight: false,
  jump: false,
};

const KEY_UP_TIMEOUT = 1500;

const usePressedKeyboardKeys = () => {
  const [move$] = useState(new BehaviorSubject<Move>(defaultMove));

  useEffect(() => {
    const movement: { [key: string]: number[] } = {
      // left or a
      left: [37, 65],
      // right or d
      right: [39, 68],
      // forward or w
      forward: [38, 87],
      // backward or d
      backward: [40, 83],
      // Q
      turnLeft: [81],
      // E
      turnRight: [69],
      // Shift
      sprint: [16],
      // Space
      jump: [32],
    };

    const movementValues: { [movement: number]: string } = {};
    Object.entries(movement).forEach(([key, val]) => {
      val.forEach((press) => (movementValues[press] = key));
    });

    const validKeyDowns$ = fromEvent(document, "keydown").pipe(
      map((event) => movementValues[(event as KeyboardEvent).keyCode]),
      filterUndefined()
    );

    const keyDownsWithExpiration$ = validKeyDowns$.pipe(
      groupBy((event) => event),
      mergeMap((event$) => {
        return event$.pipe(
          switchMap((event) => {
            const down$ = of({
              event,
              down: true,
            });

            const keyUp$ = fromEvent(document, "keyup").pipe(
              filter((e) =>
                movement[event].includes((e as KeyboardEvent).keyCode)
              )
            );

            const up$ = keyUp$.pipe(
              mapTo({
                event,
                down: false,
              })
            );

            return merge(down$, up$);
          }),
          distinctUntilChanged()
        );
      })
    );

    const movementState$ = keyDownsWithExpiration$.pipe(
      scan((move: Move, current): Move => {
        return {
          ...move,
          [current.event]: current.down,
        };
      }, defaultMove)
    );

    const movementStateWithTimeout$ = movementState$.pipe(
      switchMap((state) => {
        const existing$ = of(state);

        const timedOutState$ = timer(KEY_UP_TIMEOUT).pipe(mapTo(defaultMove));

        return merge(existing$, timedOutState$);
      })
    );

    const sub = movementStateWithTimeout$.subscribe(move$);

    return () => sub.unsubscribe();
  }, [move$]);

  return move$;
};

export default usePressedKeyboardKeys;
