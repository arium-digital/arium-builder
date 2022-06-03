import { useEffect, useState } from "react";
import { BehaviorSubject, combineLatest, EMPTY, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { peersDb } from "../db";
import isMobile from "../libs/deviceDetect";
import { filterUndefined } from "../libs/rx";
import { useTakeUntilUnmount } from "./useObservable";

const getOrientation = () => {
  // if not mobile device - always assume camera is level.
  if (!isMobile()) return 0;
  if (typeof window.orientation === "number") {
    return window.orientation;
  }

  if (window.screen && window.screen.orientation)
    return window.screen.orientation.type;

  return undefined;
};

const mobileOrientationMappings: {
  [orientationType in OrientationType]: number;
} = {
  // on mobile devices - landscape primary means camera not rotate.
  "landscape-primary": 0,
  "landscape-secondary": 180,
  // on mobile devices - portrait means camera means rotate.
  "portrait-primary": 90,
  "portrait-secondary": -90,
};

export const useObserveAndSendDeviceOrientation = ({
  sessionId$,
  userId$,
}: {
  userId$: Observable<string | undefined>;
  sessionId$: Observable<string | undefined>;
}) => {
  const [devicesOrientation$] = useState(
    () => new BehaviorSubject(getOrientation())
  );
  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    // if (isMobile()) {
    window.addEventListener("resize", () => {
      devicesOrientation$.next(getOrientation());
    });

    const mappedOrientation$ = devicesOrientation$.pipe(
      map((orientation): number | undefined => {
        if (typeof orientation === "undefined") return undefined;
        if (typeof orientation === "string") {
          const orientationType = orientation as OrientationType;

          return mobileOrientationMappings[orientationType];
        } else {
          return orientation;
        }
      })
    );

    combineLatest([
      mappedOrientation$.pipe(filterUndefined()),
      sessionId$.pipe(filterUndefined()),
      userId$.pipe(filterUndefined()),
    ])
      .pipe(takeUntilUnmount())
      .subscribe({
        next: ([orientation, sessionId, userId]) => {
          const orientationRef = peersDb.ref(
            `userDeviceOrientations/${sessionId}`
          );

          orientationRef.set({
            userId,
            orientation,
          });
        },
      });
    // }
  }, [devicesOrientation$, sessionId$, takeUntilUnmount, userId$]);
};

export const useObservePeerDeviceOrientation = ({
  peerId$,
  paused$,
}: {
  peerId$: Observable<string>;
  paused$: Observable<boolean>;
}) => {
  const [peerOrientation$] = useState(new BehaviorSubject(0));

  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    combineLatest([peerId$, paused$])
      .pipe(
        switchMap(([peerId, paused]) => {
          if (paused) return EMPTY;
          return new Observable<number>((subscribe) => {
            const orientationRef = peersDb.ref(
              `userDeviceOrientations/${peerId}`
            );

            orientationRef.on("value", (snapshot) => {
              const data = snapshot.val();

              if (data) {
                const orientation = data.orientation as number;

                subscribe.next(orientation);
              }
            });

            return () => {
              orientationRef.off("value");
            };
          });
        }),
        takeUntilUnmount()
      )
      .subscribe(peerOrientation$);
  }, [paused$, peerId$, peerOrientation$, takeUntilUnmount]);

  return peerOrientation$;
};
