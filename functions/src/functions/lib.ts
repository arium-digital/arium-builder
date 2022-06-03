import { Observable, range, timer } from "rxjs";
import { map, mergeMap, retryWhen, zip } from "rxjs/operators";

export function backOff<T>(maxTries: number, ms: number) {
  return (observable: Observable<T>) =>
    observable.pipe(
      retryWhen((attempts) =>
        range(1, maxTries).pipe(
          zip(attempts, (i) => i),
          map((i) => i * i),
          mergeMap((i) => timer(i * ms))
        )
      )
    );
}
