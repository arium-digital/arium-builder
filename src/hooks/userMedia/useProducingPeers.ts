import { ProducingPeers } from "communicationTypes";
import { observeProducingPeers } from "hooks/useProducerIds";
import { useEffect, useState } from "react";
import { BehaviorSubject, Observable } from "rxjs";

export function useProducingPeers({
  spaceId$,
}: {
  spaceId$: Observable<string>;
}): ProducingPeers {
  const [webcamProducingPeers$] = useState(
    () => new BehaviorSubject(new Set<string>())
  );
  const [micProducingPeers$] = useState(
    () => new BehaviorSubject(new Set<string>())
  );

  useEffect(() => {
    const observables = [
      observeProducingPeers({ spaceId$, kind: "webcamVideo" }).subscribe(
        webcamProducingPeers$
      ),
      observeProducingPeers({ spaceId$, kind: "webcamAudio" }).subscribe(
        micProducingPeers$
      ),
    ];

    return () => observables.forEach((x) => x.unsubscribe());
  }, [micProducingPeers$, spaceId$, webcamProducingPeers$]);

  return {
    webcamVideo: webcamProducingPeers$,
    webcamAudio: micProducingPeers$,
  };
}
