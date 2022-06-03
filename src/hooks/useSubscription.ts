import { useEffect } from "react";
import { Observable } from "rxjs";

export const useSubscription = <T>(
  subject: Observable<T> | undefined | null,
  callback: (data: T) => void
) => {
  useEffect(() => {
    if (subject) {
      const subscription = subject.subscribe(callback);
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [subject, callback]);
};
