import { FileLocation, IVector3 } from "spaceTypes";

export type AvatarConfig = {
  avatarFile?: FileLocation;
  selfViewPosition?: IVector3 | null;
  selfViewRotation?: IVector3 | null;
};
