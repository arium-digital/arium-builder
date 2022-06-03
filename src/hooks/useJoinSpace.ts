import { useEffect, useState } from "react";
import { Observable, combineLatest, from, BehaviorSubject, EMPTY } from "rxjs";
import {
  switchMap,
  distinctUntilChanged,
  pairwise,
  first,
} from "rxjs/operators";
import { useTakeUntilUnmount } from "./useObservable";
import { firestoreTimeNow, store } from "../db";
import { filterUndefined } from "libs/rx";
import { functions } from "db";

export type JoinStatus = "joined" | "full" | "disconnected" | "error";

interface JoinRequest {
  spaceId: string;
  userId: string;
  routerId?: string;
  status?: JoinStatus;
}

const requestToJoin = async ({ spaceId }: { spaceId: string }) => {
  const response = await functions().httpsCallable("joinSpace")({
    spaceId,
  });

  const joinRequestId = response.data.joinRequestId as string;

  return joinRequestId;
};

// const observeJoinRequestStatus = (joinDoc: firebase.firestore.DocumentReference) => {

// }
function observeJoinRequestChanges(sessionId: string): Observable<JoinRequest> {
  return new Observable<JoinRequest>((subscribe) => {
    const unsub = store
      .collection("joinRequests")
      .doc(sessionId)
      .onSnapshot((snapshot) => {
        subscribe.next(snapshot.data() as JoinRequest);
      });

    return () => {
      unsub();
    };
  });
}

const unjoinSession = (sessionId: string) => {
  store.collection("unjoinRequests").add({ sessionId });
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
  const [routerId$] = useState(
    new BehaviorSubject<string | undefined>(undefined)
  );
  const [joinStatus$] = useState(
    new BehaviorSubject<JoinStatus | undefined>(undefined)
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
        next: ([spaceId, userId]) => {
          const spaceVisitsDocRef = store
            .collection("users")
            .doc(userId)
            .collection("visits");

          try {
            spaceVisitsDocRef.add({
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
              switchMap(([spaceId, userId]) => {
                // if (process.env.NEXT_PUBLIC_DONT_JOIN === 'true') return from([undefined]);
                if (!userId) return from([undefined]);

                return from(requestToJoin({ spaceId })).pipe(filterUndefined());
              })
            )
            .pipe(distinctUntilChanged(), takeUntilUnmount());
        })
      )
      .subscribe(sessionId$);

    const subB = sessionId$.pipe(pairwise()).subscribe({
      next: ([lastSessionId]) => {
        if (lastSessionId) {
          unjoinSession(lastSessionId);
        }
      },
    });

    const subC = sessionId$
      .pipe(
        switchMap((sessionId) => {
          if (!sessionId) return EMPTY;

          return observeJoinRequestChanges(sessionId);
        }),
        takeUntilUnmount()
      )
      .subscribe({
        next: (joinRequest) => {
          const { status, routerId } = joinRequest;
          joinStatus$.next(status);
          joined$.next(status === "joined");
          routerId$.next(routerId);
        },
      });

    return () => {
      subA.unsubscribe();
      subB.unsubscribe();
      subC.unsubscribe();
    };
  }, [
    initialized$,
    joinStatus$,
    joined$,
    routerId$,
    sessionId$,
    spaceId$,
    takeUntilUnmount,
    userId$,
    authenticated,
  ]);

  return { sessionId$, joined$, routerId$, joinStatus$ };
};
