import { SpaceMeta } from "spaceTypes";
import { SpaceSecurity } from "../../../../shared/sharedTypes";

export type SpaceOwnership = {
  id: string;
  editor?: boolean;
  owner?: boolean;
};
export type CombinedSpaceInfo = SpaceOwnership &
  SpaceMeta &
  SpaceSecurity & { id: string } & { metaImageUrl?: string } & { slug: string };
