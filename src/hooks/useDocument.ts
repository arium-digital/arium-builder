import { store } from "db";
import merge from "lodash/merge";
import { useEffect, useState } from "react";
import { combineLatest, Observable, ReplaySubject } from "rxjs";
import { map } from "rxjs/operators";
import { useBehaviorSubjectFromCurrentValue } from "./useObservable";

export function useNullableDocument<T>({ path }: { path: string }) {
  const [document, setDocument] = useState<T | undefined>(undefined);

  useEffect(() => {
    const ref = store.doc(path);

    const unsub = ref.onSnapshot((snapshot) => {
      if (!snapshot.exists) {
        setDocument(undefined);
        return;
      }

      setDocument(snapshot.data() as T);
    });

    return () => {
      unsub();
    };
  }, [path]);

  return document;
}

function useDocument<T>({
  path,
  override,
  defaultValue,
}: // converter = (source: T | undefined | null) => source,
{
  path: string;
  defaultValue: () => T;
  override?: T | null;
  // converter?: (source: T | undefined | null) => T | undefined | null;
}): Observable<T> {
  const [document$] = useState(() => new ReplaySubject<T>(1));
  const override$ = useBehaviorSubjectFromCurrentValue(override);

  useEffect(() => {
    const ref = store.doc(path);

    const sourceObservable$ = new Observable<T | null>((subscribe) => {
      const unsub = ref.onSnapshot((snapshot) => {
        if (!snapshot.exists) {
          subscribe.next(undefined);
          return;
        }

        subscribe.next(snapshot.data() as T);
      });

      return () => {
        unsub();
      };
    });

    const sourceWithOverride$ = combineLatest([
      sourceObservable$,
      override$,
    ]).pipe(
      map(([sourceObservable, override]) => {
        const result = merge(
          {},
          defaultValue(),
          sourceObservable || {},
          override || {}
        ) as T;

        return result;
      })
    );

    const sub = sourceWithOverride$.subscribe(document$);

    return () => sub.unsubscribe();
  }, [document$, override$, path, defaultValue /*, converter*/]);

  return document$;
}

export default useDocument;
