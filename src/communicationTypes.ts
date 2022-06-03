import * as mediasoupClient from "mediasoup-client";
import { MediaKind, Transport } from "mediasoup-client/lib/types";
// import { ProtooNotification } from "protoo-client";
import { Observable } from "rxjs";
import { MediaTrackKind } from "../shared/communication";
import { WebRtcTransportKind } from "../shared/dbTypes";
import { SessionPaths } from "./shared/dbPaths";
import { PositionalAudioConfig } from "./spaceTypes";
import { StringDict } from "./types";

export interface ConsumerTrack {
  // state of actual consumer
  localPlaying: boolean;
  // state from db
  track?: MediaStreamTrack;
  consumer?: mediasoupClient.types.Consumer;
}

export type ConsumersForKind = { [peerId: string]: ConsumerTrack };

// export type serverOn = (
//   evt: "notification",
//   handler: (notif: ProtooNotification) => any
// ) => void;
export type serverRequest = <T, K>(method: string, data?: T) => Promise<K>;
export type serverNotify = (method: string, data?: any) => void;

export interface ServerClient {
  request: serverRequest;
  notify: serverNotify;
}

export interface TransportsObservables {
  consumer: Observable<Transport | undefined>;
  producer: Observable<
    | {
        transport: Transport;
        canProduce: (kind: MediaKind) => boolean;
      }
    | undefined
  >;
}

export interface PeerToPeerCommunicators {
  transports: TransportsObservables | undefined;
  server?: ServerClient;
}

export interface ConsumerData {
  producerId: string;
  consumerId: string;
  kind: MediaTrackKind;
  rtpParameters: mediasoupClient.types.RtpParameters;
}

export type ConsumersByKind = { [kind in MediaTrackKind]?: ConsumersForKind };

export type ProducerIds = { [kind in MediaTrackKind]?: StringDict };

export type MediaTracks = { [kind in MediaTrackKind]?: MediaStreamTrack };

export type BroadcastersAndMedia = {
  [peerId: string]: {
    broadcastZoneElementPath?: string;
    audioSettings: PositionalAudioConfig;
    mediaTracks: MediaTracks;
  };
};

export interface AlwaysBroadcastSettings {
  on?: boolean;
  audio?: PositionalAudioConfig;
}

export type BroadcastersAndAudioSettings = {
  [peerId: string]: PositionalAudioConfig;
};

export interface BroadcastingState {
  broadcast?: boolean;
  audio: PositionalAudioConfig | null;
}

export interface UserInfo {
  userId: string;
  sessionId?: string;
  spaceId: string;
}

export type PeersMetaData = { [peerId: string]: StringDict };

export interface PeerPresence {
  active: boolean;
  lastChanged: number;
}

export type VideoResolution = "qvga" | "vga" | "hd";
export type AudioQuality = "sd" | "hd";

export interface PeerAndDistance {
  id: string;
  distance: number;
}

export type FilteredPeersWithDistance = { [peerId: string]: number };

export type VisiblePeers = PeerAndDistance[];

export interface WebRtcTransportInfo {
  transport: mediasoupClient.types.Transport;
  kind: WebRtcTransportKind;
  transportId: string;
  device: mediasoupClient.types.Device;
  sessionPaths: SessionPaths;
}

export interface ObservedConsumerOfPeer {
  consumer: mediasoupClient.types.Consumer;
  kind: MediaTrackKind;
  producingSessionId: string;
  paused: boolean;
}

export type SingleObservedConsumer = {
  consumer: mediasoupClient.types.Consumer;
  mediaElement: HTMLMediaElement;
  paused: boolean;
};

export type ObservedConsumersOfPeer = {
  [kind in MediaTrackKind]?: SingleObservedConsumer;
};

export type AggregateObservedConsumers = {
  [producingSessionId: string]: ObservedConsumersOfPeer;
};

export interface ObservedConsumer {
  consumer: null | mediasoupClient.types.Consumer;
  mediaElement: null | HTMLMediaElement;
  kind: MediaTrackKind;
  producingSessionId: string;
  paused: boolean;
}

export interface ProducingPeersAndMax {
  producingPeers: Set<string>;
  maxToConsume: number;
}

export type ProducingPeers = {
  [kind in MediaTrackKind]?: Observable<Set<string>>;
};
