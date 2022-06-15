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
        throttleTime(throttleTimeMs, asyncScheduler, {
          leading: true,
          trailing: true,
        })
      );

      const src$ = observable$.pipe(share());
      return merge(
        src$.pipe(ignoreElements()),
        src$.pipe(buffer(throttleCalls$))
      );
    })
  );
};

export default throttledBuffer;
