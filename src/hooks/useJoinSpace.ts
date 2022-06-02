import { useEffect, useState } from "react";
import { Observable, combineLatest, BehaviorSubject, EMPTY } from "rxjs";
import {
  switchMap,
  distinctUntilChanged,
  pairwise,
  first,
} from "rxjs/operators";
import { useTakeUntilUnmount } from "./useObservable";
import { firestoreTimeNow, store } from "../db";
import { filterUndefined } from "libs/rx";

export type JoinStatus = "joined" | "full" | "disconnected" | "error";

const unjoinSession = (sessionId: string, userId: string) => {
  store.collection("unjoinRequests").add({ sessionId, userId });
};

export const useJoinSpace = ({
  initialized$,
  enteredSpace$,
  spaceId$,
  userId$,
  authenticated,
}: {
  enteredSpace$: Observable<boolean>;
  initialized$: Observable<boolean>;
  spaceId$: Observable<string>;
  userId$: Observable<string | undefined>;
  authenticated: boolean;
}) => {
  const [joined$] = useState(new BehaviorSubject(false));
  const [sessionId$] = useState(
    new BehaviorSubject<string | undefined>(undefined)
  );

  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    if (!authenticated) return;
    // log space visits
    const sub = enteredSpace$
      .pipe(
        switchMap((entered) => {
          if (!entered) return EMPTY;

          return combineLatest([
            spaceId$.pipe(distinctUntilChanged()),
            userId$.pipe(distinctUntilChanged()),
          ]);
        })
      )
      .subscribe({
        next: async ([spaceId, userId]) => {
          const spaceVisitsDocRef = store
            .collection("users")
            .doc(userId)
            .collection("visits");

          try {
            await spaceVisitsDocRef.add({
              spaceId,
              time: firestoreTimeNow(),
            });
          } catch (e) {
            console.error(e);
          }
        },
      });

    return () => sub.unsubscribe();
  }, [enteredSpace$, spaceId$, userId$, authenticated]);

  useEffect(() => {
    if (!authenticated) return;

    const subA = initialized$
      .pipe(
        switchMap((initialized) => {
          if (!initialized) return EMPTY;

          const firstSpaceId$ = spaceId$.pipe(filterUndefined(), first());

          return combineLatest([
            firstSpaceId$.pipe(distinctUntilChanged()),
            userId$.pipe(distinctUntilChanged()),
          ])
            .pipe(
              switchMap(async ([spaceId, userId]) => {
                // if (process.env.NEXT_PUBLIC_DONT_JOIN === 'true') return from([undefined]);
                const spaceVisitsDocRef = store.collection("userSessions");

                let joinSessionId: string;

                let session = {
                  spaceId,
                  userId,
                  time: firestoreTimeNow(),
                };

                try {
                  const joinSessionDoc = await spaceVisitsDocRef.add(session);

                  joinSessionId = joinSessionDoc.id;

                  return joinSessionId;
                } catch (e) {
                  console.error(e);
                  return undefined;
                }
              })
            )
            .pipe(
              filterUndefined(),
              distinctUntilChanged(),
              takeUntilUnmount()
            );
        })
      )
      .subscribe(sessionId$);

    const subB = combineLatest([
      sessionId$.pipe(pairwise()),
      userId$.pipe(filterUndefined()),
    ]).subscribe({
      next: ([[lastSessionId], userId]) => {
        if (lastSessionId) {
          unjoinSession(lastSessionId, userId);
        }
      },
    });

    return () => {
      subA.unsubscribe();
      subB.unsubscribe();
    };
  }, [
    authenticated,
    initialized$,
    sessionId$,
    spaceId$,
    takeUntilUnmount,
    userId$,
  ]);

  return { sessionId$, joined$ };
};
