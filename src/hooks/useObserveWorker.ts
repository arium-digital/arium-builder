import { useCallback, useEffect, useState } from "react";
import { Observable, Subject } from "rxjs";
import createWorkerBlobUrl, {
  TRANSFERABLE_TYPE,
} from "../Space/Controls/workers/createWorkerBlobUrl";

export const useObserveWorker = <T, K>(
  fn: (data: T) => void,
  deps: string[],
  receivedMessages$: Subject<K>
) => {
  const [sentMessages$] = useState(new Subject<T>());

  const sendMessage = useCallback(
    (message: T) => {
      sentMessages$.next(message);
    },
    [sentMessages$]
  );

  useEffect(() => {
    const blobUrl = createWorkerBlobUrl(fn, deps, TRANSFERABLE_TYPE.AUTO);
    const worker = new Worker(blobUrl);

    sentMessages$.pipe().subscribe({
      next: (message) => {
        if (message) {
          worker.postMessage(message);
        }
      },
    });

    new Observable<K>((subscribe) => {
      worker.onmessage = (message) => {
        subscribe.next(message.data as K);
      };

      return () => {
        worker.onmessage = null;
      };
    }).subscribe(receivedMessages$);

    // todo: terminate worker
    // worker.terminate();
  }, [deps, fn, receivedMessages$, sentMessages$]);

  return sendMessage;
};
