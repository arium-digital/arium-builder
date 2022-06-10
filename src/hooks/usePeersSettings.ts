import { useMemo } from "react";
import { defaultPeersSettings } from "../defaultConfigs";
import { PeersSettings, SpaceSettings } from "../types";
import { useConfigOrDefault } from "./spaceHooks";
import { useBehaviorSubjectFromCurrentValue } from "./useObservable";

const usePeersSettings = ({
  spaceSettings,
  peerSettingsOverride,
}: {
  spaceSettings: SpaceSettings;
  peerSettingsOverride?: PeersSettings;
}) => {
  const peersWithDefaults = useConfigOrDefault(
    spaceSettings.peers,
    defaultPeersSettings
  );

  const peers = useMemo((): PeersSettings => {
    // for each peers property, use override of set with default value.
    const clampToMax = (value: number | undefined, max: number) => {
      if (value) return Math.min(value, max);
      return value;
    };
    const peerSettingsWithOverrides = {
      maxAudioPeers: clampToMax(
        peerSettingsOverride?.maxAudioPeers || peersWithDefaults.maxAudioPeers,
        20
      ),
      maxVideoPeers: clampToMax(
        peerSettingsOverride?.maxVideoPeers || peersWithDefaults.maxVideoPeers,
        20
      ),
      maxPeerMediaDistance:
        peerSettingsOverride?.maxPeerMediaDistance ||
        peersWithDefaults.maxPeerMediaDistance,
      maxTweenedPeers:
        peerSettingsOverride?.maxTweenedPeers ||
        peersWithDefaults.maxTweenedPeers,
      maxVisiblePeers:
        peerSettingsOverride?.maxVisiblePeers ||
        peersWithDefaults.maxVisiblePeers,
    };
    // console.log("final peer settinsg", peerSettingsWithOverrides);
    return peerSettingsWithOverrides;
  }, [peersWithDefaults, peerSettingsOverride]);

  const maxPeers = useMemo(() => {
    return {
      webcamAudio: peers.maxAudioPeers,
      webcamVideo: peers.maxVideoPeers,
    };
  }, [peers]);

  const peersSettings$ = useBehaviorSubjectFromCurrentValue(peers);
  const maxPeers$ = useBehaviorSubjectFromCurrentValue(maxPeers);

  return {
    peersSettings$,
    maxPeers$,
  };
};

export default usePeersSettings;
