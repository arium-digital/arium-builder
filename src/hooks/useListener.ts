import { useEffect, useState } from "react";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { distinct, filter, map, pairwise, startWith } from "rxjs/operators";
import {
  useBehaviorSubjectFromCurrentValue,
  useTakeUntilUnmount,
} from "./useObservable";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export const useAudioAndListener = ({
  initialized$,
  muted,
}: {
  initialized$: Observable<boolean>;
  muted?: boolean;
}) => {
  const [listener$] = useState(
    new BehaviorSubject<THREE.AudioListener | undefined>(undefined)
  );
  const [audioContext$] = useState(
    new BehaviorSubject<AudioContext | undefined>(undefined)
  );

  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    if (muted) return;
    initialized$
      .pipe(
        distinct(),
        filter((initialized) => initialized),
        map(() => {
          return new THREE.AudioListener();
        }),
        takeUntilUnmount()
      )
      .subscribe(listener$);
  }, [initialized$, listener$, takeUntilUnmount, muted]);

  useEffect(() => {
    initialized$
      .pipe(
        distinct(),
        map((initialized) => {
          if (initialized) {
            // @ts-ignore
            const context = THREE.AudioContext.getContext() as AudioContext;

            context.resume();

            return context;
          }
          return undefined;
        }),
        takeUntilUnmount()
      )
      .subscribe(audioContext$);
  }, [audioContext$, initialized$, takeUntilUnmount]);

  return { listener$, audioContext$ };
};

export const useAttachCameraToListener = ({
  listener$,
}: {
  listener$: Observable<THREE.AudioListener | undefined> | undefined;
}) => {
  const { camera } = useThree();

  const camera$ = useBehaviorSubjectFromCurrentValue(
    camera as THREE.Camera | undefined
  );

  useEffect(() => {
    if (!listener$) return;
    combineLatest([camera$, listener$])
      .pipe(startWith([undefined, undefined]), pairwise())
      .subscribe({
        next: ([[previousCamera], [currentCamera, currentListener]]) => {
          if (!currentListener) return;

          if (previousCamera) {
            currentListener.parent = null;
            previousCamera.remove(currentListener);
          }

          if (currentCamera) {
            currentListener.parent = null;
            currentCamera.add(currentListener);
          }
        },
      });
  }, [listener$, camera$]);
};
