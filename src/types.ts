import { Observable } from "rxjs";
import { RootState } from "@react-three/fiber";
import { NextRouter } from "next/router";
import React, { SetStateAction } from "react";
import { Object3D } from "three";
import { SessionPaths } from "shared/dbPaths";
import {
  AggregateObservedConsumers,
  FilteredPeersWithDistance,
  PeersMetaData,
  ProducingPeers,
  TransportsObservables,
} from "communicationTypes";
import { EditorState } from "components/InSpaceEditor/types";
import { SelfAvatar } from "components/Consumers/SelfAvatar";
import { Theme } from "spaceTypes/theme";
import { AvatarMeshes } from "components/Consumers/AvatarMesh";
export type Setter<T> = (val: T) => void;
export interface GlobalSettings {
  activeSpaceID: string;
}

export interface PeersSettings {
  maxVisiblePeers?: number;
  maxVideoPeers?: number;
  maxAudioPeers?: number;
  maxPeerMediaDistance?: number;
  maxTweenedPeers?: number;
}

export interface ExperimentalAccess {
  physicsControls?: boolean;
  cameraControls?: boolean;
}

export type ExperimentalCameraConfig = {
  fov?: number;
  far?: number;
  fovTransitionSpeed?: number;
  farTransitionSpeed?: number;
};
export interface SpaceSettings {
  maxFileUploadSize?: number;
  peers?: PeersSettings;
  templateId?: string;
  capacity?: number;
  routerGroup?: string;
  accessToSpaceAssets?: string[];
  experimental?: ExperimentalAccess;
  disableChat?: boolean;
  disableUserMediaControls?: boolean;
}

export type PlayerPosition = [number, number, number];
export type PlayerQuaternion = [number, number, number, number];

// playerState
export interface PlayerLocation {
  position: PlayerPosition;
  quarternion: PlayerQuaternion;
  lookAt: PlayerPosition;
}

export type HasPlayerLocationObservable = {
  playerLocation$: Observable<PlayerLocation>;
};

export type PeerPlayerPositions = { [sessionId: string]: PlayerPosition };
export type PeerPlayerDistancesAndPositions = {
  [sessionId: string]: {
    position: PlayerPosition;
    distance: number;
  };
};

export type PeerPlayerRotations = { [sessionId: string]: PlayerQuaternion };
export type PeerPlayerLookAts = {
  [sessionId: string]: {
    lookAt: THREE.Quaternion;
    position: [number, number, number];
  };
};
export type PeerObject3ds = { [sessionId: string]: Object3D };

export interface UserLocation {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
}

export type UserLocations = {
  [userId: string]: UserLocation;
};

export interface Peer {
  producers: {
    audio?: string;
    video?: string;
  };
}

export type Peers = { [id: string]: Peer };

export type AnyDict = { [id: string]: any };
export type StringDict = { [id: string]: string };
export type PossiblyNullStringDict = { [id: string]: string | null };
export type PossiblyUndefinedStringDict = { [id: string]: string | undefined };

export type NumberDict = { [id: string]: number };

export type BooleanDict = { [id: string]: boolean };

export type PeerConsumers = {
  producingPeers: ProducingPeers;
  peersToSee$: Observable<FilteredPeersWithDistance>;
  peersToHear$: Observable<FilteredPeersWithDistance>;
};

export type ScreenSharingContext = {
  capture: () => Promise<void>;
  sharing$: Observable<boolean>;
  videoElement$: Observable<HTMLVideoElement | undefined>;
};

export type PartialRootState = Pick<RootState, "camera" | "gl" | "scene">;

export type ThreeContextType = {
  three: PartialRootState | null;
  setThree: (scene: PartialRootState | null) => void;
};

export type SpaceContextType = {
  spaceId: string;
  modalOpen$?: Observable<boolean>;
  setModalOpen?: Setter<boolean>;
  serverTimeOffset$: Observable<number>;
  spaceSettings?: SpaceSettings;
  spaceSlug: string;
  spaceSlugFromPath: string;
  router: NextRouter;
  initialized$: Observable<boolean>;
  listener$?: Observable<THREE.AudioListener | undefined>;
  interactable?: boolean;
  activeSessions$?: Observable<Set<string>>;
  sessionPaths$?: Observable<SessionPaths | undefined>;
  consumers$?: Observable<AggregateObservedConsumers>;
  transports$?: TransportsObservables;
  spatialAudioEnabled?: boolean;
  editorState?: EditorState;
  selfAvatar?: SelfAvatar;
  theme$: Observable<Theme>;
  avatarMeshes: AvatarMeshes | undefined;
  screenSharing?: ScreenSharingContext;
  canEdit?: boolean;
  peersMetadata: PeersMetaData | undefined;
  audioContext: AudioContext | undefined;
};

export enum LoadingStatus {
  loading,
  done,
  failed,
}

export type AcceptedFileTypes = {
  extensions: Set<string>;
  MIMETypes: string;
};

export type Optional<T> = T | undefined | null;

export type SetState<T> = React.Dispatch<SetStateAction<T>>;
