import { AvatarConfig } from "spaceTypes/AvatarConfig";
import { LegacyArtworkDisplayConfig as ArtworkDisplayConfig } from "./legacyNFtConfigs";

export type LegacyTheme = {
  defaultAvatar?: AvatarConfig;
  artwork?: ArtworkDisplayConfig;
};
