// import {
//   IceCandidate,
//   IceParameters,
//   RtpCapabilities,
//   RtpParameters,
//   SctpParameters,
// } from "mediasoup-client/lib/types";
import { DtlsParameters, MediaTrackKind } from "./communication";
import { SpaceMeta } from "./spaceMeta";

export type JoinStatus =
  | "joined"
  | "full"
  | "disconnected"
  | "error"
  | "reconnecting";

export interface JoinRequest {
  spaceId: string;
  userId: string;
  status?: JoinStatus | null;
  routerId?: string | null;
  updateTime?: number;
}

export interface PeerRouterCount {
  total: number;
  bySpace: {
    [spaceId: string]: number;
  };
}
export type PeerRouterCounts = {
  [routerId: string]: PeerRouterCount;
};

export type MediaKind = "audio" | "video";

export interface ServerConsumerInfo {
  consumerId: string;
  producerId: string;
  producingSessionId: string;
  mediaKind: MediaTrackKind;
  kind: MediaKind;
  rtpParameters: any;
}

export interface RouterInfo {
  routerId: string;
  workerPid: number;
  rtpCapabilities: any;
  group: string;
}

export interface TransportInfo {
  id: string;
  iceParameters: any;
  iceCandidates: any[];
  dtlsParameters: DtlsParameters;
  sctpParameters?: any;
}

export interface ClientProducingResult {
  kind: MediaTrackKind;
  rtpParameters: any;
}

export interface ActiveSession {
  spaceId: string;
  userId: string;
  active: boolean;
  lastChanged: number;
}

export interface RouterGroupSettings {
  maxPeersPerRouter?: number;
}

export interface UserAuthClaims {
  spaceEditor?: { [spaceName: string]: boolean };
  spaceOwner?: { [spaceName: string]: boolean };
  admin?: boolean;
  spaces?: string[];
  // shortcode for version
  v?: number;
}

export interface UserRoles {
  editor?: string[];
  owner?: string[];
  admin?: boolean;
  version?: number;
}

export interface SpaceRoleEntry {
  id: string;
  displayName: undefined;
}

export interface SpaceRoleProfile {
  displayName: string | null;
}
export interface SpaceRoleProfileWithId {
  displayName: string | null;
  id: string;
}

export interface SpaceRoles {
  editors?: string[];
  owners?: string[];
  profiles: {
    [id: string]: SpaceRoleProfile;
  };
}

export type UpdateSpaceRolesRequest = {
  spaceId: string;
  toChangeUserId: string;
  editor?: {
    add?: boolean;
    remove?: boolean;
  };
};

type Timestamp = {
  toDate(): Date;
};

export type { Timestamp };

export interface Invite {
  email?: string | null;
  name: string | null;
  betaSignupId?: string;
  sent?: boolean;
  opened?: boolean;
  used?: boolean;
  createdTime: Timestamp | Object;
  sentTimes?: Timestamp[];
  updateTime?: Timestamp;
  inviteUrl?: string;
  userId?: string;
}

export interface BetaSignUp {
  emailAddress: string;
  name: string;
  deleted?: boolean;
  inviteId?: string;
  invitedOn?: Timestamp;
  eventDescription?: string;
  signUpTime: Timestamp;
}

export interface Space {
  templateId?: string;
  password?: string | null;
  premium?: boolean;
  promoteArium?: boolean;
  ownerId?: string;
  slug?: string;
}

export interface SpaceSecurity {
  requirePassword?: boolean | null;
  password?: string | null;
}

export interface UserAccount {
  emailVerified?: boolean;
  createdSpaces?: number;
  maxSpaces?: number;
}

export interface SpaceMetaResult extends SpaceMeta, SpaceSecurity {
  metaImagePath?: string | null;
  requirePassword?: boolean;
  spaceId?: string;
}

export interface FeaturedExperiencesResult {
  experiences: {
    spaceId: string;
    meta: SpaceMeta;
  }[];
}

export type StoredFileLocation = {
  fileName: string;
  fileType: "stored";
  folder?: string;
} & (
  | {
      fileLocation: "spaceAssets";
      spaceId: string;
    }
  | {
      fileLocation: "standardAssets";
      spaceId?: undefined;
    }
  | {
      fileLocation: "spaceUserAssets";
      spaceId: string;
    }
  | {
      fileLocation: "global";
      spaceId?: undefined;
    }
);

export type ExternalFileLocation = {
  fileType: "external";
  url: string;
};

export type FileLocation = StoredFileLocation | ExternalFileLocation;

export interface RouterState {
  // spaces: string[];
  hostName: string;
  // group: string;
  max: number;
  numShards: number;
  // sessionInfo: SessionsInfo;
}

export type RouterCountShard = {
  hostName: string;
  routerId: string;
} & {
  [spaceId: string]: number;
};

export type EventType = "Exhibition Opening";
export type EventInfo = {
  published: boolean;
  eventType: EventType;
  spaceId: string;
  slug: string;
  coverImage: FileLocation; // `http://` or `gs://`
  name: string;
  hostName: string;
  startTimestamp: number;
  endTimestamp: number;
  abstract: string;
};

export type CollabatoratorInvite = {
  role: "editor";
  sessionId: string;
  // userId: string;
  fromUserId: string;
  createdTime: any;
};

export type UserProfile = {
  displayName: string | null;
  // email: string | null,
  photoURL: string | null;
};

export type SpaceInvite = {
  role: "editor";
  email: string;
  fromUserId: string;
  createdTime: any;
  pending: boolean;
  claimed: boolean;
  claimedByUserId?: string | undefined;
};

export type AcceptSpaceInviteRequest = {
  spaceId: string;
  inviteId: string;
};

export type CreateSpaceRequest = {
  slug?: string;
  templateId?: string;
  password?: string;
  ownerId?: string;
};
