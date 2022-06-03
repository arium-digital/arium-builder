import { ComponentType } from "react";
import { SpaceMeta } from "../../shared/spaceMeta";
import {
  HasPlayerLocationObservable,
  Optional,
  PlayerLocation,
} from "../types";
import { User } from "db";
import { ProfileSetter } from "./UserInterface/Profile/hooks";
import { Observable } from "rxjs";
import { SpaceQueryParams } from "./SpaceRoute/useSpaceQueryParams";
import { AuthState } from "hooks/auth/useAuthentication";

declare type JoystickDirection = "FORWARD" | "RIGHT" | "LEFT" | "BACKWARD";

export interface IJoystickUpdateEvent {
  type: "move" | "stop" | "start";
  x: number | null;
  y: number | null;
  direction: JoystickDirection | null;
}

export type HandleJoystickMove = (event: IJoystickUpdateEvent) => void;

export type EntranceFlowProps = {
  spaceId: string;
  initialize: (skipAccess: boolean) => void;
  initialized: boolean;
  enterSpace: () => void;
  setKeyboardControlsDisabled: (disabled: boolean) => void;
  spaceMetadata: SpaceMeta | undefined;
  profileSetter: ProfileSetter;
  eventSlug: Optional<string>;
  spaceSlug: string;
  inviteId: string | undefined;
  userId: Optional<string>;
} & Pick<AuthState, "isAnonymous">;

export type UserInterfaceProps = {
  audioContext: AudioContext | undefined;
  joystickMove: HandleJoystickMove;
  fullScreenElement: HTMLElement | null;
  spaceId: string | undefined;
  user: User | undefined;
  profileSetter: ProfileSetter;
  setKeyboardControlsDisabled: (disabled: boolean) => void;
  disableUserMediaControls: boolean;
  spaceSlug: string;
  canInviteToEdit: boolean;
} & HasPlayerLocationObservable;

export interface SceneModifierProps {
  userId?: string;
  spaceId: string | undefined;
  setSpaceId: (spaceId: string) => void;
  pushState?: (path: string) => void;
}

export interface PhysicsSettings {
  movementSpeed?: number;
  gravity?: number;
  jumpSpeed?: number;
}

export interface ControlsSettings extends PhysicsSettings {
  dragSpeed?: number;
  turnSpeed?: number;
  disableKeyboardControls?: boolean;
  disableMovementControls?: boolean;
  disableCollisions?: boolean;
  disableGroundDetection?: boolean;
}

export type SpaceProps = {
  spaceSlugFromPath: string;
  spaceId: string;
  UserInterface?: ComponentType<UserInterfaceProps>;
  muted?: boolean;
  fullScreen?: boolean;
  // if should automatically initialize, assuming something on the screen
  // has been clicked already
  autoInitialize?: boolean;
  spaceMetadata?: SpaceMeta;
  disableChat?: boolean;
  disableUserMediaControls?: boolean;
  skipOnboarding?: boolean;
  canEdit?: boolean;
  spaceSlug: string;
  playerLocation$: Observable<PlayerLocation>;
  updatePlayerLocation: (playerLocation: PlayerLocation) => void;
} & Partial<Omit<SpaceQueryParams, "targetSlug">>;
