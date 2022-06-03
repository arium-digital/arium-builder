import { filterUndefined } from "libs/rx";
import { useEffect, useMemo, useState } from "react";
import { distinctUntilChanged, first, skipUntil } from "rxjs/operators";
import { Optional } from "types";
import {
  useBehaviorSubjectFromCurrentValue,
  useTakeUntilUnmount,
} from "../useObservable";

const useUserIdChanged = (userId: Optional<string>) => {
  const userId$ = useBehaviorSubjectFromCurrentValue(userId || undefined);

  const takeUntilUnmount = useTakeUntilUnmount();

  const [userIdCount, setUserIdCount] = useState(0);

  const userIdChanged = useMemo(() => {
    return userIdCount >= 2;
  }, [userIdCount]);

  useEffect(() => {
    const userIdSet$ = userId$.pipe(
      distinctUntilChanged(),
      filterUndefined(),
      first()
    );

    // once a user id has been set, wait for a change in the user id.
    const userIdChanged$ = userId$.pipe(
      distinctUntilChanged(),
      takeUntilUnmount(),
      skipUntil(userIdSet$)
    );

    const sub = userIdChanged$.subscribe({
      next: () => {
        setUserIdCount((existing) => existing + 1);
      },
    });

    return () => {
      sub.unsubscribe();
    };
  }, [takeUntilUnmount, userId$]);

  return userIdChanged;
};

export default useUserIdChanged;
