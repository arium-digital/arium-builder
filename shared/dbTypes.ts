import { MediaTrackKind } from "./communication";

export type WebRtcTransportKind = "consuming" | "producing";

export interface SessionOnRouter {
  spaceId: string;
  userId: string;
  routerId: string;
  rtpCapabilities: any;
  sessionId: string;
}

export interface WebRtcConnectionResult {
  dtlsParameters: any;
}

export type PeerProducingState = {
  [kind in MediaTrackKind]?: boolean;
};

export type PeersProducingStates = {
  [sessionId: string]: PeerProducingState;
};

export type PeersToConsume = {
  [kind in MediaTrackKind]: {
    [sessionId: string]: boolean;
  };
};
