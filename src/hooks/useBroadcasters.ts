import { BroadcastingControlsState } from "components/componentTypes";
import { defaultBroadcastZoneSoundConfig } from "defaultConfigs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BehaviorSubject, combineLatest, from, Observable } from "rxjs";
import { filter, map, skipUntil, switchMap } from "rxjs/operators";
import {
  BroadcastersAndAudioSettings,
  BroadcastingState,
} from "../communicationTypes";
import { PositionalAudioConfig } from "../spaceTypes";
import {
  BroadcastingRecords,
  observeBroadcasters,
  updateIfAlwaysBroadcasting,
} from "../stateFromDb";
import { useBehaviorSubjectFromCurrentValue } from "./useObservable";

const getSoundSettingsOfFirstZoneBroadcastingIn = (zones?: {
  [zonePath: string]: BroadcastingState;
}): PositionalAudioConfig | undefined => {
  if (!zones) return;

  let result: PositionalAudioConfig | null = null;

  Object.values(zones).forEach((broadcastStateOfZone) => {
    if (broadcastStateOfZone.broadcast) {
      result = broadcastStateOfZone.audio;
      return;
    }
  });

  return result || undefined;
};

const getSoundSettingsIfShouldAutoBroadcast = (
  autoBroadcast?: boolean
): PositionalAudioConfig | undefined => {
  if (!autoBroadcast) return undefined;

  return defaultBroadcastZoneSoundConfig();
};

const extractActiveBroadcastersAndAudioSettings = ({
  records,
  activePeerIds,
}: {
  records: BroadcastingRecords;
  activePeerIds: Set<string>;
}) => {
  const broadcasters: BroadcastersAndAudioSettings = {};

  Object.entries(records).forEach(([sessionId, record]) => {
    if (!activePeerIds.has(sessionId)) return;
    // if should autobroadcast, then add to list of broadcasters with
    // auto broadcast audio settings or defaults.
    const soundSettingsIfAutoBroadcast = getSoundSettingsIfShouldAutoBroadcast(
      record.autoBroadcast
    );
    if (soundSettingsIfAutoBroadcast) {
      broadcasters[sessionId] = soundSettingsIfAutoBroadcast;
      return;
    }

    // get sound settings of the first zone broadcasting in.  if one is found,
    // then set sounds settings for that broadcast zone as the broadcaster sound settings.
    const firstZoneBroadcastingIn = getSoundSettingsOfFirstZoneBroadcastingIn(
      record.zones
    );
    if (firstZoneBroadcastingIn) {
      broadcasters[sessionId] = firstZoneBroadcastingIn;
      return;
    }
  });

  return broadcasters;
};

export const useBroadcasters = ({
  canManuallyBroadcast,
  sessionId$,
  spaceId$,
  userId$,
  activePresence$,
}: {
  canManuallyBroadcast: boolean | undefined;
  sessionId$: Observable<string | undefined>;
  spaceId$: Observable<string | undefined>;
  userId$: Observable<string | undefined>;
  activePresence$: Observable<Set<string>>;
}): {
  broadcasters$: Observable<BroadcastersAndAudioSettings>;
  controls: BroadcastingControlsState;
} => {
  const [manuallyBroadcasting, setManuallyBroadcasting] = useState(false);
  const manuallyBroadcast$ = useBehaviorSubjectFromCurrentValue(
    manuallyBroadcasting
  );

  const toggleBroadcasting = useCallback(() => {
    setManuallyBroadcasting((existing) => !existing);
  }, [setManuallyBroadcasting]);

  const broadcastingControls: BroadcastingControlsState = useMemo(
    () => ({
      broadcasting: manuallyBroadcasting,
      canManuallyBroadcast,
      toggleBroadcasting,
    }),
    [manuallyBroadcasting, canManuallyBroadcast, toggleBroadcasting]
  );

  useEffect(() => {
    const manuallyBroadcastIsTrue = manuallyBroadcast$.pipe(
      filter((x) => x === true)
    );
    const startWhenManuallyBroadcast$ = manuallyBroadcast$.pipe(
      skipUntil(manuallyBroadcastIsTrue)
    );
    const sub = combineLatest([
      startWhenManuallyBroadcast$,
      sessionId$,
      spaceId$,
      userId$,
    ]).subscribe({
      next: ([manuallyBroadcast, sessionId, spaceId, userId]) => {
        if (!userId || !sessionId || !spaceId) return;
        // todo, clean up.
        updateIfAlwaysBroadcasting(
          {
            sessionId,
            userId,
            spaceId,
          },
          !!manuallyBroadcast
        );
      },
    });

    return () => {
      sub.unsubscribe();
    };
  }, [manuallyBroadcast$, sessionId$, userId$, spaceId$]);

  const [broadcasters$] = useState(
    new BehaviorSubject<BroadcastersAndAudioSettings>({})
  );

  useEffect(() => {
    const broadcasterRecords$ = combineLatest([spaceId$, sessionId$]).pipe(
      switchMap(([spaceId, sessionId]) => {
        if (!spaceId || !sessionId) return from([{}]);
        return observeBroadcasters({
          spaceId,
        });
      })
    );

    const subscription = combineLatest([broadcasterRecords$, activePresence$])
      .pipe(
        map(([broadcasters, activePresence]) => {
          return extractActiveBroadcastersAndAudioSettings({
            records: broadcasters,
            activePeerIds: activePresence,
          });
        })
      )
      .subscribe(broadcasters$);

    return () => {
      subscription.unsubscribe();
    };
  }, [activePresence$, broadcasters$, sessionId$, spaceId$]);

  return { broadcasters$, controls: broadcastingControls };
};
