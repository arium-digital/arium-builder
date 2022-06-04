import { useBehaviorSubjectFromCurrentValue } from "hooks/useObservable";
import { useEffect, useMemo, useState } from "react";
import { combineLatest, from, interval, Observable } from "rxjs";
import { distinctUntilChanged, map, switchMap } from "rxjs/operators";
import { PlaySettings, VideoPlaySettings } from "spaceTypes";
import { Timestamp } from "db";
import { AudioPlaySettings } from "spaceTypes/audio";

const observePlayTime$ = ({
  playSettings,
  serverTimeOffset$,
  duration$,
  playStartTimeMs$,
}: {
  playSettings: PlaySettings;
  serverTimeOffset$: Observable<number>;
  duration$: Observable<number | undefined>;
  playStartTimeMs$: Observable<number | undefined>;
}): Observable<{
  computedStartTime: number | undefined;
  seekTime: number | undefined;
}> => {
  if (!playSettings.syncToTimeline) {
    return from([
      {
        computedStartTime: 0,
        seekTime: undefined,
      },
    ]);
  }

  return combineLatest([serverTimeOffset$, playStartTimeMs$, duration$]).pipe(
    map(([offset, playStartTimeMs = 0, duration]) => {
      const currentTime = (new Date().getTime() - offset) / 1000;

      const playStartTimeS = playStartTimeMs / 1000;

      const seekTime = duration
        ? (currentTime - playStartTimeS) % duration
        : playStartTimeS;

      return {
        computedStartTime: undefined,
        seekTime,
      };
    })
  );
};

const observePlayAndStartTime = ({
  shouldPlay$,
  playSettings$,
  serverTimeOffset$,
  playStartTimeMs$,
  duration$,
}: {
  shouldPlay$: Observable<boolean>;
  playSettings$: Observable<PlaySettings>;
  serverTimeOffset$: Observable<number>;
  playStartTimeMs$: Observable<number | undefined>;
  duration$: Observable<number | undefined>;
}) => {
  return combineLatest([shouldPlay$, playSettings$]).pipe(
    switchMap(([play, playSettings]) => {
      if (!play)
        return from([
          {
            shouldPlay: false,
            computedStartTime: 0,
            seekTime: undefined,
          },
        ]);

      return observePlayTime$({
        duration$,
        playSettings,
        playStartTimeMs$,
        serverTimeOffset$,
      }).pipe(
        map(({ computedStartTime, seekTime }) => ({
          computedStartTime,
          seekTime,
          shouldPlay: true,
        }))
      );
    })
  );
};

export const usePlayVideo = ({
  playSettings,
  initialized$,
  serverTimeOffset$,
  playStartTime,
  viewDirectionIntersectsPlayGeometry,
  disabled,
}: {
  playSettings: VideoPlaySettings;
  initialized$?: Observable<boolean>;
  serverTimeOffset$?: Observable<number>;
  playStartTime?: Timestamp;
  viewDirectionIntersectsPlayGeometry: () => boolean;
  disabled: boolean;
}) => {
  const [mediaDuration, setMediaDuration] = useState<number>();
  const [
    { shouldPlay, computedStartTime, seekTime },
    setPlayAndStarTime,
  ] = useState<{
    shouldPlay: boolean;
    computedStartTime: number | undefined;
    seekTime: number | undefined;
  }>({
    shouldPlay: false,
    computedStartTime: undefined,
    seekTime: undefined,
  });

  const playSettings$ = useBehaviorSubjectFromCurrentValue(playSettings);

  const duration$ = useBehaviorSubjectFromCurrentValue(mediaDuration);

  const playStartTimeMs = useMemo(() => playStartTime?.toDate().getTime(), [
    playStartTime,
  ]);

  const playStartTimeMs$ = useBehaviorSubjectFromCurrentValue(playStartTimeMs);

  const disabled$ = useBehaviorSubjectFromCurrentValue(disabled);

  useEffect(() => {
    if (!initialized$ || !serverTimeOffset$) return;
    const shouldPlay$ = combineLatest([
      initialized$,
      playSettings$,
      disabled$,
    ]).pipe(
      switchMap(([initialized, playSettings, disabled]) => {
        if (!initialized || disabled) return from([false]);
        if (playSettings.auto) {
          return from([true]);
        }

        return interval(250).pipe(
          map(() => {
            return viewDirectionIntersectsPlayGeometry();
          })
        );
      }),
      distinctUntilChanged()
    );

    const sub = observePlayAndStartTime({
      duration$,
      playSettings$,
      playStartTimeMs$,
      serverTimeOffset$,
      shouldPlay$,
    }).subscribe({
      next: (result) => {
        setPlayAndStarTime(result);
      },
    });

    return () => sub.unsubscribe();
  }, [
    playSettings$,
    serverTimeOffset$,
    duration$,
    playStartTimeMs$,
    initialized$,
    viewDirectionIntersectsPlayGeometry,
    disabled$,
  ]);

  return {
    shouldPlay,
    computedStartTime,
    seekTime,
    setMediaDuration,
  };
};

export const usePlayAudio = ({
  playSettings,
  initialized$,
  serverTimeOffset$,
  playStartTime,
  disabled,
  getDistanceFromSoundSquared,
}: {
  playSettings: AudioPlaySettings;
  initialized$?: Observable<boolean>;
  serverTimeOffset$?: Observable<number>;
  playStartTime?: Timestamp;
  disabled: boolean;
  getDistanceFromSoundSquared: () => number;
}) => {
  const [mediaDuration, setMediaDuration] = useState<number>();
  const [
    { shouldPlay, computedStartTime, seekTime },
    setPlayAndStarTime,
  ] = useState<{
    shouldPlay: boolean;
    computedStartTime: number | undefined;
    seekTime: number | undefined;
  }>({
    shouldPlay: false,
    computedStartTime: undefined,
    seekTime: undefined,
  });

  const playSettings$ = useBehaviorSubjectFromCurrentValue(playSettings);

  const duration$ = useBehaviorSubjectFromCurrentValue(mediaDuration);

  const playStartTimeMs = useMemo(() => playStartTime?.toDate().getTime(), [
    playStartTime,
  ]);

  const playStartTimeMs$ = useBehaviorSubjectFromCurrentValue(playStartTimeMs);

  const disabled$ = useBehaviorSubjectFromCurrentValue(disabled);

  useEffect(() => {
    if (!initialized$ || !serverTimeOffset$) return;
    const shouldPlay$ = combineLatest([
      initialized$,
      playSettings$,
      disabled$,
    ]).pipe(
      switchMap(([initialized, playSettings, disabled]) => {
        if (!initialized || disabled) return from([false]);

        const maxDistance = playSettings.maxDistance || 200;
        const maxDistanceSquared = maxDistance * maxDistance;

        return interval(250).pipe(
          map(() => {
            return getDistanceFromSoundSquared() < maxDistanceSquared;
          })
        );
      }),
      distinctUntilChanged()
    );

    const sub = observePlayAndStartTime({
      duration$,
      playSettings$,
      playStartTimeMs$,
      serverTimeOffset$,
      shouldPlay$,
    }).subscribe({
      next: (result) => {
        setPlayAndStarTime(result);
      },
    });

    return () => sub.unsubscribe();
  }, [
    playSettings$,
    serverTimeOffset$,
    duration$,
    playStartTimeMs$,
    initialized$,
    disabled$,
    getDistanceFromSoundSquared,
  ]);

  return {
    shouldPlay,
    computedStartTime,
    seekTime,
    setMediaDuration,
  };
};
