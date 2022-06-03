import { from, Observable } from "rxjs";
import { producingPeers } from "../shared/dbPaths";
import { bufferTime, filter, scan, switchMap } from "rxjs/operators";
import { producingPeersDb, DataSnapshot } from "db";
import { MediaTrackKind } from "../../shared/communication";

export const observeProducingPeers = ({
  spaceId$,
  kind,
}: {
  spaceId$: Observable<string | undefined>;
  kind: MediaTrackKind;
}): Observable<Set<string>> => {
  return spaceId$.pipe(
    switchMap((spaceId) => {
      if (!spaceId) {
        return from([new Set<string>()]);
      } else {
        const toObserve = producingPeersDb.ref(
          producingPeers({ spaceId, kind })
        );

        return new Observable<{
          peerId: string;
          paused: boolean;
        }>((subscribe) => {
          const peerProducerChanged = (snapshot: DataSnapshot) => {
            const peerId = snapshot.key as string;

            const { paused } = snapshot.val() as { paused: boolean };
            // console.log("child added", peerId, peerProducingState);

            subscribe.next({ peerId, paused });
          };
          // toObserve.once("value", (allSnapshots) => {
          //   allSnapshots.forEach(peerProducerChanged);
          // });
          toObserve.on("child_added", peerProducerChanged);
          toObserve.on("child_changed", peerProducerChanged);
          toObserve.on("child_removed", (snapshot) => {
            const peerId = snapshot.key as string;

            const { paused } = snapshot.val() as { paused: boolean };

            // console.log("child remove", peerId);
            subscribe.next({ peerId, paused });
          });

          return () => {
            toObserve.off("child_added");
            toObserve.off("child_changed");
            toObserve.off("child_removed");
          };
        }).pipe(
          // buffer to not update so often
          bufferTime(250),
          filter((updates) => updates.length > 0),
          scan((acc: Set<string>, current): Set<string> => {
            current.forEach((update) => {
              if (update.paused) {
                acc.delete(update.peerId);
              } else {
                acc.add(update.peerId);
              }
            });
            // console.log("latest acc", acc, current, result);

            return acc;
          }, new Set<string>())
        );
      }
    })
  );
};
