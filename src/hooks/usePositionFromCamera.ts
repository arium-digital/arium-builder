import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { BehaviorSubject, interval } from "rxjs";
import { map } from "rxjs/operators";
import { useTakeUntilUnmount } from "./useObservable";

export const usePositionFromCamera = (updateInterval: 500) => {
  const { camera } = useThree();

  const [position$] = useState(
    new BehaviorSubject<[number, number, number]>([
      camera.position.x,
      camera.position.y,
      camera.position.z,
    ])
  );

  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    interval(updateInterval)
      .pipe(
        map(() => {
          return [camera.position.x, camera.position.y, camera.position.z] as [
            number,
            number,
            number
          ];
        }),
        takeUntilUnmount()
      )
      .subscribe(position$);
  }, [camera, position$, takeUntilUnmount, updateInterval]);

  return position$;
};
