import { Concrete } from "hooks/spaceHooks";
import { AvatarConfig } from "./AvatarConfig";
import { ImageSettings } from "./image";
// import { ArtworkDisplayConfig } from "./legacyConfigs/legacyNFtConfigs";
import { NftPlacardSettings } from "./nftConfig";
import { PlacardDisplayConfig } from "./placard";
import { HasFrameConfig } from "./text";
import { VideoSettings } from "./video";

export type Theme = {
  version?: string | null;
  defaultAvatar?: AvatarConfig;
  frame?: HasFrameConfig;
  video?: VideoSettings;
  image?: ImageSettings;
  nftPlacard?: NftPlacardSettings;
  placardDisplay?: PlacardDisplayConfig;
  // nft?: Pick<ArtworkDisplayConfig, 'showMedia' | 'showPlacard' | 'placardDisplay'>;
};

export type GetThemeOrDefault<T> = (
  theme: Theme
) => {
  fromTheme: T | undefined;
  defaults: Concrete<T>;
};
