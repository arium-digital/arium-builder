import { pipe } from "rxjs";
import { filter, map, scan } from "rxjs/operators";

export const filterUndefined = <T>() => {
  return pipe(
    // @ts-ignore
    filter((x: T | undefined) => typeof x !== "undefined"),
    map((x: T) => x)
  );
};

export const filterNullOrUndefined = <T>() => {
  return pipe(
    // @ts-ignore
    filter((x: Optional<T>) => typeof x !== "undefined" && x !== null),
    map((x: T) => x)
  );
};

export type StringDictToAny = { [key: string]: any };

export function aggregateBy<T extends StringDictToAny, J extends keyof T, K>(
  keyProp: J,
  mapTo: (input: T) => K
) {
  return pipe(
    scan((acc: { [key: string]: K }, current: T) => {
      const prop = current[keyProp];

      const val = mapTo(current);

      acc[prop] = val;

      return acc;
    }, {})
  );
}
