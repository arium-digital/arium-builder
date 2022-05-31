import { useState, useEffect } from "react";
import {
  from,
  merge,
  BehaviorSubject,
  timer,
  Observable,
  combineLatest,
} from "rxjs";
import {
  distinctUntilChanged,
  filter,
  first,
  groupBy,
  map,
  mapTo,
  mergeMap,
  scan,
  switchMap,
} from "rxjs/operators";
import { communicationDb, DataSnapshot, serverTime } from "../db";
import { subscribeToActiveSessionChanges } from "../stateFromDb";

const sessionPaths = () => `userSessions`;
const sessionPath = (sessionId: string) =>
  communicationDb.ref(`${sessionPaths()}/${sessionId}`);

// how ofter the session should be updated with the last active time
const activeUpdateInterval = 30000;

// const updateInterval = 5 * 1000;
export const useUpdateActivePresence = ({
  invisible,
  authenticated,
  userId,
  sessionId,
  spaceId,
}: {
  invisible: boolean | undefined;
  authenticated: boolean;
  userId: string | undefined;
  sessionId: string | undefined;
  spaceId: string | undefined;
}) => {
  useEffect(() => {
    if (invisible) return;

    // if the app crashes or user disconnected, this updates the session to say its not active
    // it can only update for the active user
    if (!userId || !sessionId || !authenticated || !spaceId) return;

    const sessionRef = sessionPath(sessionId);

    const onDisconnect = sessionRef.onDisconnect();

    onDisconnect.set({
      active: false,
      userId,
      spaceId,
      lastChanged: serverTime(),
    });

    return () => {
      onDisconnect.cancel();
    };
  }, [invisible, sessionId, userId, spaceId, authenticated]);

  useEffect(() => {
    if (!authenticated || invisible || !sessionId) return;

    const sessionRef = sessionPath(sessionId);
    const interval = setInterval(() => {
      // every 60 seconds, mark as active. this can be used as a last resort
      // to clear inactive sessions.
      sessionRef.update({
        active: true,
        lastChanged: serverTime(),
      });
    }, activeUpdateInterval);

    return () => {
      window.clearInterval(interval);
    };
  }, [authenticated, invisible, sessionId]);

  useEffect(() => {
    // on connection change, this updates the active session indicating if its active or not.
    if (invisible || !sessionId || !userId) return;

    const sessionRef = sessionPath(sessionId);

    const onConnectionChanged = (snapshot: DataSnapshot) => {
      const connected = snapshot.val() as boolean;

      sessionRef.update({
        active: connected === true,
        userId,
        lastChanged: serverTime(),
      });
    };

    communicationDb.ref(".info/connected").on("value", onConnectionChanged);

    return () => {
      communicationDb.ref(".info/connected").off("value", onConnectionChanged);
    };
  }, [sessionId, userId, invisible]);

  useEffect(() => {
    // this sets the space and user id of the active session
    if (invisible) return;

    if (!userId || !spaceId || !sessionId) return;

    const sessionRef = sessionPath(sessionId);
    sessionRef.update({
      spaceId,
      userId,
      active: true,
      lastChanged: serverTime(),
    });
  }, [invisible, sessionId, spaceId, userId]);
};

export const isStillActive = ({
  maxDifference,
  lastChanged,
  currentTime,
}: {
  maxDifference: number;
  lastChanged: number;
  currentTime: number;
}) => {
  const minServerTime = currentTime - maxDifference;

  return lastChanged >= minServerTime;
};

interface ActiveSessionConfig {
  /** the max time that a session must have been active for before being
   * filtered out
   */
  maxActiveDifference: number;
  /** how often to check if we got an update for a user for their active time.
   * in essence this acts as a delay; if we don't get an update in this amount of time
   *  we consider them stale.
   */
  activeTimeout: number;
  /** When session disconnects, how long to give that user until considering that user
   * not active
   */
  inactiveTimeout: number;
}

const activeUntilTimeout$ = (
  {
    active,
    lastChanged,
  }: {
    active: boolean;
    lastChanged: number;
  },
  {
    maxActiveDifference,
    activeTimeout: activeCheckDuration,
    inactiveTimeout: sessionDisconnectedTimeout,
  }: ActiveSessionConfig
) => {
  // get the minimum time the session must have been updated
  // this will take into account the time difference between
  // the users computer and the value stored in firebase db
  // only include the session if its active and its last changed
  // is greater than min server time.

  // if its already been a while since we have gotten an update, assume its
  // inactive and dont include
  const currentTime = new Date().getTime();
  if (
    !isStillActive({
      lastChanged,
      maxDifference: maxActiveDifference,
      currentTime,
    })
  ) {
    return from([false]);
  }

  // even if inactive, give a bit of time before considering inactive.
  const current$ = from([true]);

  let inactiveTimeout$: Observable<boolean>;
  if (active) {
    inactiveTimeout$ = timer(activeCheckDuration).pipe(first(), mapTo(false));
  } else {
    inactiveTimeout$ = timer(sessionDisconnectedTimeout).pipe(
      first(),
      mapTo(false)
    );
  }

  return merge(current$, inactiveTimeout$);
};

const observeActiveSessions = (
  {
    spaceId,
    sessionId: currentSessionId,
    serverTimeOffset$,
  }: {
    spaceId: string;
    sessionId: string | undefined;
    serverTimeOffset$: Observable<number>;
  },
  activeSessionConfig: ActiveSessionConfig
) => {
  return subscribeToActiveSessionChanges(spaceId, serverTimeOffset$).pipe(
    filter(({ sessionId }) => sessionId !== currentSessionId),
    groupBy((change) => change.sessionId),
    mergeMap((sessionChange$) => {
      const sessionId = sessionChange$.key;
      return sessionChange$.pipe(
        switchMap(({ active, lastChanged }) => {
          return activeUntilTimeout$(
            { active, lastChanged },
            activeSessionConfig
          );
        }),
        distinctUntilChanged(),
        map((active) => ({
          active,
          sessionId,
        }))
      );
    }),
    // merge active sessions into a set...but create a new set
    // each time so that the state update is triggered.
    scan((values: Set<string>, { active, sessionId }): Set<string> => {
      if (active && !values.has(sessionId)) {
        const result = new Set(values);
        result.add(sessionId);
        return result;
      } else if (!active && values.has(sessionId)) {
        const result = new Set(values);
        result.delete(sessionId);
        return result;
      }
      return values;
    }, new Set<string>()),
    distinctUntilChanged()
  );
};

const useActiveSessions = ({
  spaceId$,
  sessionId$,
  serverTimeOffset$,
}: {
  spaceId$: Observable<string | undefined>;
  sessionId$: Observable<string | undefined>;
  serverTimeOffset$: Observable<number>;
}) => {
  const [activePresence$] = useState(
    () => new BehaviorSubject<Set<string>>(new Set<string>())
  );

  useEffect(() => {
    const sub = combineLatest([spaceId$, sessionId$])
      .pipe(
        switchMap(([spaceId, sessionId]) => {
          if (!spaceId) return from([new Set<string>()]);
          return observeActiveSessions(
            { spaceId, sessionId, serverTimeOffset$ },
            {
              maxActiveDifference: 120000,
              activeTimeout: 60000,
              inactiveTimeout: 4000,
            }
          );
        })
      )
      .subscribe(activePresence$);

    return () => {
      sub.unsubscribe();
    };
  }, [spaceId$, activePresence$, sessionId$, serverTimeOffset$]);

  return activePresence$;
};

export default useActiveSessions;
