import { asyncScheduler, merge, Observable, pipe } from "rxjs";
import {
  buffer,
  ignoreElements,
  publish,
  share,
  //   tap,
  throttleTime,
} from "rxjs/operators";

// source:
// https://stackoverflow.com/questions/66913467/in-rxjs-how-can-you-make-a-throttled-buffer-operator/66941053?noredirect=1#comment118399493_66941053
const throttledBuffer = <T>(throttleTimeMs: number) => {
  return pipe(
    publish((observable$: Observable<T>) => {
      const throttleCalls$ = observable$.pipe(
        // tap((v) => console.log("in throttle", v)),
        throttleTime(throttleTimeMs, asyncScheduler, {
          leading: true,
          trailing: true,
        })
        // tap(() => console.log("after throttle"))
      );

      const src$ = observable$.pipe(share());
      return merge(
        src$.pipe(ignoreElements()),
        src$.pipe(/* tap(console.log), */ buffer(throttleCalls$))
      );
    })
    /*  tap(x => console.log('throttled:', x))*/
  );
};

export default throttledBuffer;
