import { useEffect, useState } from "react";
import createWorkerBlobUrl, { TRANSFERABLE_TYPE } from "./createWorkerBlobUrl";

export const useWorker = <T, K>(
  fn: (data: T) => void,
  deps: string[],
  onMessage: (data: K) => void
) => {
  const [postMessage, setPostMessage] = useState<{ fn: (data: T) => void }>();

  useEffect(() => {
    const blobUrl = createWorkerBlobUrl(fn, deps, TRANSFERABLE_TYPE.AUTO);

    const worker = new Worker(blobUrl);

    worker.onmessage = (e) => {
      onMessage(e.data);
    };

    const postMessage = {
      fn: (message: T) => {
        if (message) worker.postMessage(message);
      },
    };
    setPostMessage(postMessage);

    return () => {
      setPostMessage(undefined);
      worker.terminate();
    };
  }, [fn, deps, onMessage]);

  return postMessage ? postMessage.fn : undefined;
};
