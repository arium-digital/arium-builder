import { useState } from "react";
import { BehaviorSubject, Observable } from "rxjs";
import { BroadcastersAndAudioSettings } from "../communicationTypes";

export const useBroadcasters = (): {
  broadcasters$: Observable<BroadcastersAndAudioSettings>;
} => {
  const [broadcasters$] = useState(
    new BehaviorSubject<BroadcastersAndAudioSettings>({})
  );

  return { broadcasters$ };
};
