import { useCallback, useEffect, useState } from "react";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

export type TakeUntilUnmount = () => <T>(
  source: Observable<T>
) => Observable<T>;

export const useTakeUntilUnmount = (): TakeUntilUnmount => {
  const [unmount$] = useState(new Subject<boolean>());

  useEffect(() => {
    return () => {
      unmount$.next(true);
    };
  }, [unmount$]);

  const takeUntilUnmount = useCallback(
    () =>
      function <T>(source: Observable<T>): Observable<T> {
        return source.pipe(takeUntil(unmount$));
      },
    [unmount$]
  );

  return takeUntilUnmount;
};

export const useCurrentValueOrDefault = <T>(
  observable: Observable<T> | null | undefined,
  defaultValue: T
): T => {
  const [current, setCurrent] = useState<T>(defaultValue);
  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    observable &&
      observable.pipe(takeUntilUnmount()).subscribe({
        next: setCurrent,
      });
  }, [observable, takeUntilUnmount]);

  return current;
};

export const useCurrentValueFromBehaviorSubject = <T>(
  observable: BehaviorSubject<T>
): T => {
  const [current, setCurrent] = useState<T>(observable.value);
  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    observable.pipe(takeUntilUnmount()).subscribe({
      next: setCurrent,
    });
  }, [observable, takeUntilUnmount]);

  return current;
};

export const useCurrentValueFromObservable = <T>(
  observable: Observable<T> | undefined | null,
  defaultValue: T
) => {
  const [current, setCurrent] = useState<T>(defaultValue);

  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    if (observable)
      observable.pipe(takeUntilUnmount()).subscribe({
        next: setCurrent,
      });
  }, [observable, takeUntilUnmount]);

  return current;
};

export const useCurrentValueFromObservableGetter = <T>(
  observableGetter: (() => Observable<T>) | undefined,
  defaultValue: T
) => {
  const [current, setCurrent] = useState<T>(defaultValue);

  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    if (observableGetter)
      observableGetter().pipe(takeUntilUnmount()).subscribe({
        next: setCurrent,
      });
  }, [observableGetter, takeUntilUnmount]);

  return current;
};

export const usePossiblyUndefinedCurrentValueFromObservable = <T>(
  observable: Observable<T>
): T | undefined => {
  const [current, setCurrent] = useState<T>();

  const takeUntilUnmount = useTakeUntilUnmount();

  useEffect(() => {
    observable.pipe(takeUntilUnmount()).subscribe({
      next: setCurrent,
    });
  }, [observable, takeUntilUnmount]);

  return current;
};

export const useBehaviorSubjectFromObservable = <T>(
  observable: () => Observable<T>,
  initial: T
): BehaviorSubject<T> => {
  const [subject] = useState(new BehaviorSubject<T>(initial));

  useEffect(() => {
    const sub = observable().subscribe(subject);
    return () => {
      sub.unsubscribe();
    };
  }, [observable, subject]);

  useEffect(() => {
    return () => {
      subject.complete();
    };
  }, [subject]);

  return subject;
};

export const useBehaviorSubjectFromCurrentValue = <T>(
  value: T
): BehaviorSubject<T> => {
  const [subject] = useState(new BehaviorSubject<T>(value));

  useEffect(() => {
    // ensure we dont call next twice with the first value.
    if (subject.value !== value) {
      subject.next(value);
    }
  }, [value, subject]);

  useEffect(() => {
    return () => {
      subject.complete();
    };
  }, [subject]);
  return subject;
};

export const useBehaviorSubjectAndSetterFromCurrentValue = <T>(
  value: T
): [BehaviorSubject<T>, (val: T) => void] => {
  const subject = useBehaviorSubjectFromCurrentValue(value);

  const setter = useCallback(
    (nextValue: T) => {
      subject.next(nextValue);
    },
    [subject]
  );

  return [subject, setter];
};

export const useObservableGenerator = <T>(
  subject: Subject<T> | BehaviorSubject<T>
): (() => Observable<T>) => {
  const generator = useCallback(() => subject.asObservable(), [subject]);

  return generator;
};
