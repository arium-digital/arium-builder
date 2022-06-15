import { sortedIndex } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { BehaviorSubject, interval } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators";
import { Vector3 } from "three";
import {
  useBehaviorSubjectFromCurrentValue,
  useCurrentValueFromBehaviorSubject,
} from "./useObservable";

const defaultBreakPoints = [8, 16, 24, 32];
const defaultIntervals = [200, 600, 2000, 4000, 6000];

export const useIsInRange$ = (
  targetPosition: Vector3,
  triggerDistance: number,
  intervalAdjustment = 0 // a workaround to slowdown even stop the distance checking
): BehaviorSubject<boolean> => {
  const {
    camera: { position },
  } = useThree();

  const triggerDistanceSquared = useMemo(() => Math.pow(triggerDistance, 2), [
    triggerDistance,
  ]);

  const [breakpoints, intervals]: Array<Array<number>> = useMemo(() => {
    const triggerDistance = Math.sqrt(triggerDistanceSquared);
    const breakpoints = defaultBreakPoints.map((d) =>
      Math.pow(triggerDistance + d, 2)
    );
    const intervals = defaultIntervals.map((v) => v + intervalAdjustment);
    return [breakpoints, intervals];
  }, [triggerDistanceSquared, intervalAdjustment]);

  const isInRange$ = useBehaviorSubjectFromCurrentValue(false);

  const [checkInterval, setCheckInterval] = useState(intervals[0]);
  const checkIsInRangeAndUpdateInterval = useCallback(() => {
    const newDistance = position.distanceToSquared(targetPosition);
    const newInterval = intervals[sortedIndex(breakpoints, newDistance)];
    setCheckInterval(newInterval);
    // turn on the log to see the interval of this trigger
    return newDistance < triggerDistanceSquared;
  }, [
    position,
    targetPosition,
    breakpoints,
    intervals,
    triggerDistanceSquared,
  ]);

  useEffect(() => {
    setCheckInterval(intervals[0]);
  }, [intervals]);

  useEffect(() => {
    const sub = interval(checkInterval)
      .pipe(
        map(() => checkIsInRangeAndUpdateInterval()),
        distinctUntilChanged()
      )
      .subscribe(isInRange$);
    return () => {
      sub.unsubscribe();
    };
  }, [checkInterval, isInRange$, checkIsInRangeAndUpdateInterval]);

  return isInRange$;
};

/**
 * How this works.
 * This hook will update the distance from the camera to a target position periodically
 * the interval is dynanmic to balance the performance and responsiveness
 *
 * in short,
 * if the user is far away, it updates less offen. say once per 5 seconds.
 * if the user is close, it update 10 times perseconds.
 * You can pass a few break points, with intervals
 *
 * @param targetWorldPosition
 * @param triggerDistance
 * @param intervalAdjustment
 * @returns boolean indicating if user is within triggerDistanceSquared
 */
export const useIsInRange = (
  targetWorldPosition: Vector3,
  triggerDistance: number,
  intervalAdjustment = 0 // a workaround to slowdown even stop the distance checking
): boolean => {
  const isInRange$ = useIsInRange$(
    targetWorldPosition,
    triggerDistance,
    intervalAdjustment
  );
  const isInRange = useCurrentValueFromBehaviorSubject(isInRange$);
  return isInRange;
};
