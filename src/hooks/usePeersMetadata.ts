import { PossiblyUndefinedStringDict, StringDict } from "../types";
import { realtimeDb } from "../db";
import { useEffect, useState } from "react";
import { PeersMetaData } from "../communicationTypes";
import { subscribeToPeersMetadata } from "../stateFromDb";
import { stripUndefined } from "libs/utils";
import { combineLatest, Observable, merge } from "rxjs";
import { useBehaviorSubjectFromCurrentValue } from "./useObservable";
import { filterUndefined } from "libs/rx";
import { publishReplay, switchMap } from "rxjs/operators";

export const METADATA_KEYS = {
  name: "displayName",
  photo: "photo",
  bodyColor: "bodyColor",
  avatarScale: "avatarScale",
};

export const useMetadata = ({
  intialMetadata,
  userId$,
  spaceId$,
  sessionId$,
}: {
  intialMetadata: PossiblyUndefinedStringDict | undefined;
  userId$: Observable<string | undefined>;
  spaceId$: Observable<string | undefined>;
  sessionId$: Observable<string | undefined>;
}) => {
  // const metadataRef = useMemo(
  //   () => sessionId && realtimeDb.ref(`userMetadata/${sessionId}`),
  //   [sessionId]
  // );

  const [metadata, setMetadata] = useState<StringDict | undefined>(() =>
    intialMetadata ? stripUndefined(intialMetadata) : undefined
  );

  const metadata$ = useBehaviorSubjectFromCurrentValue(metadata);

  useEffect(() => {
    const metadataRef$ = combineLatest([
      sessionId$.pipe(filterUndefined()),
      userId$.pipe(filterUndefined()),
    ]).pipe(
      switchMap(async ([sessionId, userId]) => {
        const ref = realtimeDb.ref(`userMetadata/${sessionId}`);

        await ref.set({
          userId,
        });

        return ref;
      })
    );

    const sub = metadataRef$
      .pipe(
        publishReplay(1, undefined, (ref$) => {
          const spaceIdChanges$ = combineLatest([
            ref$,
            spaceId$.pipe(filterUndefined()),
          ]).pipe(
            switchMap(async ([ref, spaceId]) => {
              await ref.update({ spaceId });
            })
          );

          const metadataChanges$ = combineLatest([
            ref$,
            metadata$.pipe(filterUndefined()),
          ]).pipe(
            switchMap(async ([ref, metadata]) => {
              await ref.update({ metadata });
            })
          );

          return merge(spaceIdChanges$, metadataChanges$);
        })
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [metadata$, spaceId$, userId$, sessionId$]);

  return {
    metadata,
    setMetadata,
  };
};

export const usePeerMetadata = ({
  spaceId,
}: {
  spaceId: string | undefined;
}) => {
  const [peersMetadata, setPeersMetadata] = useState<PeersMetaData>({});

  useEffect(() => {
    if (spaceId) {
      const unsubscribe = subscribeToPeersMetadata({
        spaceId,
        setPeersMetadata,
      });

      return () => {
        unsubscribe();
      };
    }
  }, [setPeersMetadata, spaceId]);

  return peersMetadata;
};
