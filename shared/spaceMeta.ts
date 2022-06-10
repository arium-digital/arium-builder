import { FileLocation } from "./sharedTypes";

export interface SpaceMeta {
  welcomeHTML?: string;
  name?: string;
  metaImage?: FileLocation;
  doesNotExist?: boolean;
  hostName?: string;
}

export interface DefaultSpaceSettings extends SpaceMeta {
  welcomeHTML: string;
}
