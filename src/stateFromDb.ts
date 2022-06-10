import { PlayerPosition, PlayerQuaternion, StringDict } from "./types";
import { realtimeDb } from "./db";
import { Dispatch, SetStateAction } from "react";
import { PeersMetaData, PeerPresence } from "./communicationTypes";
import { Observable } from "rxjs";
import { filter, map, withLatestFrom } from "rxjs/operators";

interface ActiveSessionChange {
  sessionId: string;
  active: boolean;
  lastChanged: number;
  time: "local" | "server";
}

export const subscribeToActiveSessionChanges = (
  spaceId: string,
  serverTimeOffset$: Observable<number>
) => {
  const sessionsRef = realtimeDb
    .ref("userSessions")
    .orderByChild("spaceId")
    .equalTo(spaceId);

  return new Observable<ActiveSessionChange>((subscribe) => {
    sessionsRef.once("value", (snapshot) => {
      snapshot.forEach((entry) => {
        const sessionId = entry.key as string;
        const values = entry.val() as PeerPresence;
        subscribe.next({
          sessionId,
          active: values.active,
          lastChanged: values.lastChanged,
          time: "server",
        });
      });
    });

    sessionsRef.on("child_changed", (snapshot) => {
      const sessionId = snapshot.key as string;
      const { active, lastChanged } = snapshot.val() as PeerPresence;

      subscribe.next({
        active,
        lastChanged: lastChanged,
        sessionId,
        time: "server",
      });
    });

    sessionsRef.on("child_removed", (snapshot) => {
      subscribe.next({
        sessionId: snapshot.key as string,
        active: false,
        lastChanged: new Date().getTime(),
        time: "local",
      });
    });

    sessionsRef.on("child_added", (snapshot) => {
      const sessionId = snapshot.key as string;
      const { active, lastChanged } = snapshot.val() as PeerPresence;

      subscribe.next({
        sessionId,
        active,
        lastChanged: lastChanged,
        time: "server",
      });
    });

    return () => {
      sessionsRef.off("child_added");
      sessionsRef.off("child_removed");
      sessionsRef.off("child_changed");
    };
  }).pipe(
    withLatestFrom(serverTimeOffset$),
    map(([change, timeDiff]) => {
      if (change.time === "local") return change;

      return {
        ...change,
        lastChanged: change.lastChanged - timeDiff,
        time: "local",
      };
    })
  );
};

export interface StateUpdate {
  sessionId: string;
}

export interface StateChange<T> extends StateUpdate {
  change: T;
  remove?: undefined;
}

export interface StateRemoval extends StateUpdate {
  playerState?: undefined;
  remove: true;
}

export const observePeerSessionStateChanges = <T>({
  parentPath,
  sessionId,
  converter,
  activeSessions$,
}: {
  parentPath: string;
  sessionId: string;
  activeSessions$: Observable<Set<string>>;
  converter: (data: any) => T;
}) => {
  return new Observable<StateRemoval | StateChange<T>>((subscribe) => {
    const ref = realtimeDb.ref(parentPath);

    ref.on("value", (snapshot) => {
      snapshot.forEach((child) => {
        const key = child.key;

        if (!key) return;

        subscribe.next({
          sessionId: key,
          change: converter(child.val()),
        });
      });
    });

    ref.on("child_changed", (snaphot) => {
      const key = snaphot.key;
      if (!key) return;
      subscribe.next({
        sessionId: key,
        change: converter(snaphot.val()),
      });
    });

    ref.on("child_removed", (snapshot) => {
      const sessionId = snapshot.key;
      if (sessionId) {
        subscribe.next({
          sessionId,
          remove: true,
        });
      }
    });

    ref.on("child_added", (snapshot) => {
      const key = snapshot.key;
      if (!key) return;
      subscribe.next({
        sessionId: key,
        change: converter(snapshot.val()),
      });
    });

    return () => {
      ref.off("value");
      ref.off("child_changed");
      ref.off("child_removed");
      ref.off("child_added");
    };
  }).pipe(
    filter(
      ({ sessionId: sessionIdOfChange }) => sessionIdOfChange !== sessionId
    ),
    withLatestFrom(activeSessions$),
    map(([change, activeSessions]): StateChange<T> | StateRemoval => {
      if (!activeSessions.has(change.sessionId)) {
        return {
          ...change,
          remove: true,
        };
      }

      return change;
    })
  );
};

export const observePeerPlayerPositions = ({
  spaceId,
  sessionId,
  activeSessions$,
}: {
  spaceId: string;
  sessionId: string;
  activeSessions$: Observable<Set<string>>;
}) => {
  return observePeerSessionStateChanges<PlayerPosition>({
    parentPath: `userPositions/${spaceId}`,
    sessionId,
    activeSessions$,
    converter: ({ position }: any) => position,
  });
};

export const observePeerPlayerQuarternions = ({
  spaceId,
  sessionId,
  activeSessions$,
}: {
  spaceId: string;
  sessionId: string;
  activeSessions$: Observable<Set<string>>;
}) => {
  return observePeerSessionStateChanges<PlayerQuaternion>({
    parentPath: `userRotations/${spaceId}`,
    sessionId,
    activeSessions$,
    converter: ({ quaternion }: any) => quaternion,
  });
};

export const subscribeToPeersMetadata = ({
  spaceId,
  setPeersMetadata,
}: {
  spaceId: string;
  setPeersMetadata: Dispatch<SetStateAction<PeersMetaData>>;
}) => {
  const peersMetadataRef = realtimeDb
    .ref("userMetadata")
    .orderByChild("spaceId")
    .equalTo(spaceId);

  peersMetadataRef.once("value", (snapshot) => {
    const peersMetaData: PeersMetaData = {};

    snapshot.forEach((entry) => {
      const peerId = entry.key as string;
      const { metadata } = entry.val();
      peersMetaData[peerId] = metadata;
    });

    setPeersMetadata(peersMetaData);
  });

  function updateMetadata(id: string, metadata?: StringDict) {
    setPeersMetadata((existing) => {
      if (!metadata) {
        const result = {
          ...existing,
        };
        delete result[id];
        return result;
      } else
        return {
          ...existing,
          [id]: metadata,
        };
    });
  }

  peersMetadataRef.on("child_changed", (snapshot) => {
    const peerId = snapshot.key as string;
    const { metadata } = snapshot.val() || {};

    updateMetadata(peerId, metadata);
  });

  peersMetadataRef.on("child_removed", (snapshot) => {
    updateMetadata(snapshot.key as string, undefined);
  });

  peersMetadataRef.on("child_added", (snapshot) => {
    const peerId = snapshot.key as string;
    const { metadata } = snapshot.val() || {};

    updateMetadata(peerId, metadata);
  });

  const unsubscribe = () => {
    peersMetadataRef.off("child_added");
    peersMetadataRef.off("child_removed");
    peersMetadataRef.off("child_changed");
  };

  return unsubscribe;
};
