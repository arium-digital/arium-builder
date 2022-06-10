import { realtimeDb } from "db";
import { useCallback, useEffect, useState } from "react";
import { BehaviorSubject, Observable } from "rxjs";
import { useCurrentValueFromObservable } from "./useObservable";

const observeServerTimeOffset = () => {
  return new Observable<number>((subscribe) => {
    const offsetRef = realtimeDb.ref(".info/serverTimeOffset");
    offsetRef.on("value", (snap) => {
      const offset = snap.val();
      subscribe.next(offset);
    });

    return () => {
      offsetRef.off("value");
    };
  });
};

const useServerTimeOffset = () => {
  const [serverTimeOffset$] = useState(new BehaviorSubject<number>(0));

  useEffect(() => {
    const sub = observeServerTimeOffset().subscribe(serverTimeOffset$);

    return () => {
      sub.unsubscribe();
    };
  }, [serverTimeOffset$]);

  return serverTimeOffset$;
};

export const useGetServerTime = (): (() => number) => {
  const serverTimeOffset$ = observeServerTimeOffset();
  const serverTimeOffset = useCurrentValueFromObservable(serverTimeOffset$, 0);

  const getServerTime = useCallback(() => {
    return new Date().getTime() + serverTimeOffset;
  }, [serverTimeOffset]);

  return getServerTime;
};
export default useServerTimeOffset;
