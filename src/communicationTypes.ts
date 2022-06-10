import { Observable } from "rxjs";
import { PositionalAudioConfig } from "spaceTypes";
import { MediaTrackKind } from "../shared/communication";
import { StringDict } from "./types";

export type BroadcastersAndAudioSettings = {
  [peerId: string]: PositionalAudioConfig;
};

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

export type ProducingPeers = {
  [kind in MediaTrackKind]?: Observable<Set<string>>;
};
