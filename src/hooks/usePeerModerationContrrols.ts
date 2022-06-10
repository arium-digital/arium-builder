import { useCallback, useContext, useEffect, useState } from "react";
import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { useShortcutToggledBoolean } from "./useMousetrap";
import { useBehaviorSubjectFromCurrentValue } from "./useObservable";
import { SpaceAccessContext } from "./auth/useSpaceAccess";

export interface ModerationState {
  enable: boolean;
  selectPeer: (peerId: string | null) => void;
  moderatingPeer$: Observable<string | null>;
}

const usePeerModerationControls = ({
  spaceId,
}: {
  spaceId: string | undefined;
}): ModerationState => {
  const spaceAccess = useContext(SpaceAccessContext);

  const canEdit = !!spaceAccess?.canEdit;

  const [active] = useShortcutToggledBoolean("m");

  const [peerSelected$] = useState(new Subject<string | null>());
  const [moderatingPeer$] = useState(new BehaviorSubject<string | null>(null));

  const selectPeerForModeration = useCallback(
    (peerId: string | null) => {
      peerSelected$.next(peerId);
    },
    [peerSelected$]
  );

  const active$ = useBehaviorSubjectFromCurrentValue(active);

  useEffect(() => {
    // clear state on active change
    selectPeerForModeration(null);
  }, [active, selectPeerForModeration]);

  useEffect(() => {
    const sub = combineLatest([active$, peerSelected$])
      .pipe(
        map(([active, peerSelected]) => {
          if (!active) return null;

          return peerSelected;
        })
      )
      .subscribe(moderatingPeer$);

    return () => {
      sub.unsubscribe();
    };
  }, [active$, moderatingPeer$, peerSelected$]);

  return {
    enable: canEdit && active,
    selectPeer: selectPeerForModeration,
    moderatingPeer$,
  };
};

export default usePeerModerationControls;
