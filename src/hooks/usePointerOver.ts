import { useCallback, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Object3D, Vector3 } from "three";
import { useIsInRange$ } from "hooks/useIsInRange";
import { BehaviorSubject, from, interval } from "rxjs";
import styles from "css/space.module.scss";
import {
  useBehaviorSubjectFromCurrentValue,
  useCurrentValueFromBehaviorSubject,
} from "./useObservable";
import { distinctUntilChanged, map, switchMap } from "rxjs/operators";

export const usePointerOver$ = (
  mesh: Object3D | undefined,
  maxDistance = 10,
  disabled = false
): BehaviorSubject<boolean> => {
  const pointerOver$ = useBehaviorSubjectFromCurrentValue(false);

  const [targetWorldPosition, setTargetWorldPosition] = useState<Vector3>(
    new Vector3()
  );

  useEffect(() => {
    setTargetWorldPosition((prev) => {
      mesh?.getWorldPosition(prev);
      return prev;
    });
  }, [mesh]);

  const isInRange$ = useIsInRange$(
    targetWorldPosition,
    maxDistance,
    disabled ? 3600000 : 300
  );

  const { raycaster } = useThree();

  const checkPointerOver = useCallback(() => {
    if (!mesh) return false;
    const intersections = raycaster.intersectObject(mesh, true);
    return intersections.length > 0;
  }, [mesh, raycaster]);

  useEffect(() => {
    if (disabled) {
      pointerOver$.next(false);
      return;
    }

    const sub = isInRange$
      .pipe(
        switchMap((isInRange) =>
          !isInRange
            ? from([false])
            : interval(100).pipe(
                map(() => checkPointerOver()),
                distinctUntilChanged()
              )
        )
      )
      .subscribe(pointerOver$);
    return () => {
      sub.unsubscribe();
    };
  }, [isInRange$, checkPointerOver, disabled, pointerOver$]);

  return pointerOver$;
};

/**
 * @param mesh the target object to check ray casting.
 * @param maxDistance will stop raycaster if user is out of range
 * @param disabled stop checking and always return false if disabled
 * @returns boolean indicating if the pointer is over the mesh
 */
export const usePointerOver = (
  mesh: Object3D | undefined,
  maxDistance = 10,
  disabled = false
): boolean => {
  const pointerOver$ = usePointerOver$(mesh, maxDistance, disabled);
  const pointerOver = useCurrentValueFromBehaviorSubject(pointerOver$);
  const { gl } = useThree();

  useEffect(() => {
    if (pointerOver) gl.domElement?.classList.add(styles.clickable);
    else gl.domElement?.classList.remove(styles.clickable);
  }, [pointerOver, gl]);

  return pointerOver;
};
