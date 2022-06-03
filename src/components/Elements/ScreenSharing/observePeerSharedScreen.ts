import { AggregateObservedConsumers } from "communicationTypes";
import { communicationDb } from "db";
import debug from "debug";
import {
  updatePeersToConsume,
  toDeltas,
} from "components/Consumers/hooks/consumerUtils";
import { filterUndefined } from "libs/rx";
import { combineLatest, from, merge, Observable } from "rxjs";
import {
  map,
  pluck,
  publishReplay,
  switchMap,
  tap,
  ignoreElements,
} from "rxjs/operators";
import { SessionPaths } from "shared/dbPaths";
import { AudioAndVideoElement } from "./captureOrConsumerScreenShare";

type SharersAtPath = {
  [userId: string]: {
    [sessionId: string]: boolean;
  };
};

const getSharingSessionIdNotOfCurrentUser = (
  sharersAtPath: SharersAtPath | undefined,
  currentUserSessionId: string,
  activeSessions: Set<string>
): string | undefined => {
  if (!sharersAtPath) return undefined;
  const sharingUsers = Object.entries(sharersAtPath);

  for (let i = 0; i < sharingUsers.length; i++) {
    const sharingSessions = sharingUsers[i][1];
    if (!sharingSessions) continue;
    const sharingSessionsEntries = Object.entries(sharingSessions);

    for (let j = 0; j < sharingSessionsEntries.length; j++) {
      const [sessionId, sharing] = sharingSessionsEntries[j];
      if (sessionId === currentUserSessionId) continue;
      if (!activeSessions.has(sessionId)) continue;
      if (sharing === true) {
        return sessionId;
      }
    }
  }

  return undefined;
};

export const screenSharingPath = ({
  spaceId,
  mediaPath,
}: {
  spaceId: string;
  mediaPath: string;
}) => `sharingScreen/${spaceId}/${mediaPath}`;

const observeScreenSharingSessionNotOfCurrentUser = ({
  spaceId$,
  mediaPath$,
  activeSessions$,
  currentUserSessionId$,
}: {
  spaceId$: Observable<string>;
  mediaPath$: Observable<string>;
  currentUserSessionId$: Observable<string>;
  activeSessions$: Observable<Set<string>>;
}): Observable<string | undefined> => {
  const screenSharingPath$ = combineLatest([spaceId$, mediaPath$]).pipe(
    map(([spaceId, mediaPath]) => screenSharingPath({ spaceId, mediaPath }))
  );

  const sharersAtPath$ = screenSharingPath$.pipe(
    switchMap((path) => {
      return new Observable<SharersAtPath>((subscribe) => {
        const ref = communicationDb.ref(path);
        ref.on("value", (snapshot) => {
          const sharersAtPath = snapshot.val() as SharersAtPath;
          subscribe.next(sharersAtPath);
        });
        return () => {
          ref.off("value");
        };
      });
    })
  );

  return combineLatest([
    sharersAtPath$,
    currentUserSessionId$,
    activeSessions$,
  ]).pipe(
    map(([sharersAtPath, currentUserSessionId, activeSessions]) => {
      const sharingSessionId = getSharingSessionIdNotOfCurrentUser(
        sharersAtPath,
        currentUserSessionId,
        activeSessions
      );

      debug("screenShare:updatedSharingSessionId")({
        sharersAtPath,
        sharingSessionId,
      });

      return sharingSessionId;
    })
  );
};

export const observePeerIdThatIsSharingScreen = ({
  sessionPaths$,
  mediaPath$,
  spaceId$,
  activeSessions$,
}: {
  sessionPaths$: Observable<SessionPaths | undefined>;
  mediaPath$: Observable<string>;
  spaceId$: Observable<string>;
  activeSessions$: Observable<Set<string>>;
}) => {
  return observeScreenSharingSessionNotOfCurrentUser({
    mediaPath$,
    spaceId$,
    activeSessions$,
    currentUserSessionId$: sessionPaths$.pipe(
      filterUndefined(),
      pluck("sessionId")
    ),
  });
};

const requestPeersToConsume = ({
  peerIdThatIsSharingScreen$,
  sessionPaths$,
}: {
  peerIdThatIsSharingScreen$: Observable<string | undefined>;
  sessionPaths$: Observable<SessionPaths | undefined>;
}) => {
  const peersToPlayDeltas$ = toDeltas(
    peerIdThatIsSharingScreen$.pipe(
      map((sessionId) => {
        if (sessionId) return new Set<string>([sessionId]);

        return new Set<string>();
      })
    )
  );

  return combineLatest([
    sessionPaths$.pipe(filterUndefined()),
    peersToPlayDeltas$,
  ]).pipe(
    tap(([sessionPaths, peersToPlayChanges]) => {
      // todo: also request consume
      updatePeersToConsume({
        sessionPaths,
        peersToPlayChanges,
        kind: "screenVideo",
      });
      updatePeersToConsume({
        sessionPaths,
        peersToPlayChanges,
        kind: "screenAudio",
      });
    })
  );
};

const observePeerAudioAndVideo = ({
  peerIdThatIsSharingScreen$,
  consumers$,
}: {
  peerIdThatIsSharingScreen$: Observable<string | undefined>;
  consumers$: Observable<AggregateObservedConsumers>;
}): Observable<AudioAndVideoElement> => {
  const peerAndAudioVideo$ = peerIdThatIsSharingScreen$.pipe(
    switchMap((sharingPeerSessionId) => {
      if (!sharingPeerSessionId)
        return from([{ video: undefined, audio: undefined }]);

      debug("screenShare:getSharingPeerMedia")({ sharingPeerSessionId });

      return consumers$
        .pipe(pluck(sharingPeerSessionId), filterUndefined())
        .pipe(
          map((consumersOfPeer) => {
            if (!consumersOfPeer)
              return {
                video: null,
                audio: null,
              };
            return {
              video: consumersOfPeer.screenVideo
                ?.mediaElement as HTMLVideoElement | null,
              audio: consumersOfPeer.screenAudio
                ?.mediaElement as HTMLAudioElement | null,
            };
          })
        );
    })
  );
  return peerAndAudioVideo$ as Observable<AudioAndVideoElement>;
};

const observeAndRequestConsumersForPeerSharingMedia = ({
  sessionPaths$,
  consumers$,
  peerIdThatIsSharingScreen$,
}: {
  sessionPaths$: Observable<SessionPaths | undefined>;
  consumers$: Observable<AggregateObservedConsumers>;
  peerIdThatIsSharingScreen$: Observable<string | undefined>;
}): Observable<AudioAndVideoElement> => {
  const peerAudioAndVideo$ = peerIdThatIsSharingScreen$.pipe(
    publishReplay(1, undefined, (peerId$) => {
      // send request for peers to consume
      const requests$ = requestPeersToConsume({
        sessionPaths$,
        peerIdThatIsSharingScreen$: peerId$,
      });
      // observe media of that peer
      const peerAudioAndVideo$ = observePeerAudioAndVideo({
        consumers$,
        peerIdThatIsSharingScreen$: peerId$,
      });

      return merge(requests$.pipe(ignoreElements()), peerAudioAndVideo$);
    })
  );

  return peerAudioAndVideo$;
};

export default observeAndRequestConsumersForPeerSharingMedia;
