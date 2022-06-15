import { useEffect, useState } from "react";
import {
  BehaviorSubject,
  combineLatest,
  from,
  Observable,
  pipe,
  range,
  timer,
} from "rxjs";
import {
  catchError,
  distinctUntilChanged,
  map,
  mapTo,
  mergeMap,
  mergeScan,
  retryWhen,
  switchMap,
  zip,
} from "rxjs/operators";
import { useBehaviorSubjectFromCurrentValue } from "../../hooks/useObservable";

function backoff(maxTries: number, ms: number) {
  return pipe(
    retryWhen((attempts) =>
      range(1, maxTries).pipe(
        zip(attempts, (i) => i),
        map((i) => i * i),
        mergeMap((i) => timer(i * ms))
      )
    )
  );
}

export const tryPlayWithBackoffRetry = (
  element: HTMLMediaElement,
  backoffTimes = 2,
  retryInterval = 500
) =>
  from([element])
    .pipe(
      switchMap((element) => {
        return element.play();
      })
    )
    .pipe(
      backoff(backoffTimes, retryInterval),
      mapTo(true),
      catchError(() => {
        return from([false]);
      })
    );

export const playOrPause = ({
  element,
  play,
  playing,
}: {
  element: HTMLMediaElement | undefined;
  play: boolean;
  playing: boolean;
}) => {
  if (!element) return from([false]);

  // if we dont need to change, dont do anything.
  if (play === playing) return from([playing]);

  // pause video
  if (!play) {
    element.pause();

    return from([false]);
  }

  // try playing up to 3 times with a 1 second delay
  const tryPlayResult$ = tryPlayWithBackoffRetry(element);

  return tryPlayResult$;
};

export const useStreamPlayer = ({
  element,
  paused$,
}: {
  element: HTMLMediaElement | undefined;
  paused$: Observable<boolean>;
}) => {
  const element$ = useBehaviorSubjectFromCurrentValue(element);

  const [playing$] = useState(new BehaviorSubject<boolean>(false));

  useEffect(() => {
    const play$ = paused$.pipe(map((paused) => !paused));
    // since we subscribe to when playing status changes,
    // we can skip when we get play updates, but then make
    // sure playing status matches what should be happening.
    const sub = combineLatest([
      play$.pipe(distinctUntilChanged()),
      element$.pipe(distinctUntilChanged()),
    ])
      .pipe(
        mergeScan(
          (playing: boolean, [play, element]) => {
            return playOrPause({
              element,
              play,
              playing,
            });
          },
          false,
          1
        )
      )
      .subscribe(playing$);

    return () => {
      sub.unsubscribe();
    };
  }, [element, element$, playing$, paused$]);

  return playing$;
};

export default useStreamPlayer;
