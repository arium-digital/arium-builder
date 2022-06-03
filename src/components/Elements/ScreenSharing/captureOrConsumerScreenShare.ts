import { AggregateObservedConsumers } from "communicationTypes";
import { communicationDb } from "db";
import { filterUndefined } from "libs/rx";
import { Observable, from, combineLatest, merge, concat } from "rxjs";
import {
  distinctUntilChanged,
  exhaustMap,
  ignoreElements,
  map,
  publishReplay,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { SessionPaths } from "shared/dbPaths";
import { ScreenSharingContext } from "types";
import observeAndRequestConsumersForPeerSharingMedia, {
  observePeerIdThatIsSharingScreen,
  screenSharingPath,
} from "./observePeerSharedScreen";

export interface AudioAndVideoElement {
  video: HTMLVideoElement | null;
  audio: HTMLAudioElement | null;
}

const setScreenSharingSession = ({
  spaceId,
  userId,
  sessionId,
  mediaPath,
  sharing,
}: {
  spaceId: string;
  userId: string;
  sessionId: string;
  mediaPath: string;
  sharing: boolean;
}) => {
  const path = `${screenSharingPath({
    spaceId,
    mediaPath,
  })}/${userId}/${sessionId}`;

  if (sharing) {
    communicationDb.ref(path).set(true);
    communicationDb.ref(path).onDisconnect().remove();
  } else {
    communicationDb.ref(path).remove();
  }
};

const captureOrReceiveScreenShare = ({
  sessionPaths$,
  mediaPath$,
  spaceId$,
  activeSessions$,
  consumers$,
  clickedToPlay$,
  sharing$,
  capture,
  videoElement$,
  complete$,
}: {
  sessionPaths$: Observable<SessionPaths | undefined>;
  mediaPath$: Observable<string>;
  spaceId$: Observable<string>;
  activeSessions$: Observable<Set<string>>;
  consumers$: Observable<AggregateObservedConsumers>;
  clickedToPlay$: Observable<true>;
  complete$: Observable<void>;
} & ScreenSharingContext): Observable<AudioAndVideoElement> => {
  const peerIdThatIsSharingScreen$ = observePeerIdThatIsSharingScreen({
    sessionPaths$,
    mediaPath$,
    spaceId$,
    activeSessions$,
  });

  // when unmount, set peer id that is sharing screen as null.
  // when complete emits, peer id that is sharing screen completes.
  // then emit an undefined
  const peerIdThatIsSharingScreenOrUndefinedWhenComplete$ = concat(
    peerIdThatIsSharingScreen$.pipe(takeUntil(complete$)),
    from([undefined])
  );

  const result$ = peerIdThatIsSharingScreenOrUndefinedWhenComplete$.pipe(
    distinctUntilChanged(),
    publishReplay(1, undefined, (sharingPeerId$) => {
      const consumingPeerMedia$ = observeAndRequestConsumersForPeerSharingMedia(
        {
          peerIdThatIsSharingScreen$: sharingPeerId$,
          consumers$,
          sessionPaths$,
        }
      );

      const peerIsSharing$ = sharingPeerId$.pipe(
        map((value) => typeof value === "undefined"),
        distinctUntilChanged()
      );

      const capturedMediaAndStatus$ = peerIsSharing$.pipe(
        switchMap((peerIsSharing) => {
          // otherwise, capture screenshare and produce it, returning its media
          if (!peerIsSharing)
            return from([{ video: null, audio: null, sharing: false }]);

          // TODO: cancel sending if someone else shares?
          return clickedToPlay$.pipe(
            exhaustMap(() => {
              return capture();
            }),
            switchMap(() => {
              return sharing$.pipe(
                switchMap((sharing) => {
                  if (!sharing) {
                    return from([
                      {
                        audio: null,
                        video: null,
                        sharing: false,
                      },
                    ]);
                  }
                  return videoElement$.pipe(
                    filterUndefined(),
                    map((videoElement) => ({
                      audio: null,
                      video: videoElement || null,
                      sharing: true,
                    }))
                  );
                })
              );
            })
          );
        })
      );

      const capturedAndProducedVideoAndAudio$ = capturedMediaAndStatus$.pipe(
        publishReplay(1, undefined, (sharing$) => {
          const isSharing$ = sharing$.pipe(
            map(({ audio, video }) => !!audio || !!video),
            distinctUntilChanged()
          );

          // here we update the server if this session is sharing or not.
          const update$ = isSharing$.pipe(
            withLatestFrom(
              combineLatest([
                sessionPaths$.pipe(filterUndefined()),
                spaceId$,
                mediaPath$,
              ])
            ),
            tap(([sharing, [sessionPaths, spaceId, mediaPath]]) => {
              setScreenSharingSession({
                spaceId,
                sessionId: sessionPaths.sessionId,
                userId: sessionPaths.userId,
                mediaPath,
                sharing,
              });
            })
          );

          return merge(update$.pipe(ignoreElements()), sharing$);
        })
      );

      return combineLatest([
        consumingPeerMedia$,
        capturedAndProducedVideoAndAudio$,
        sharingPeerId$,
      ]).pipe(
        map(
          ([
            consumingPeerMedia,
            capturedAndProducedVideoAndAudio,
            sharingPeerId,
          ]) => {
            if (sharingPeerId) return consumingPeerMedia;

            return capturedAndProducedVideoAndAudio;
          }
        )
      );
    })
  );

  return result$;
};

export default captureOrReceiveScreenShare;
