import { ImageConfig } from "./image";
import { LightConfig } from "./light";
import { ModelConfig } from "./model";
import { ReflectorSurfaceConfig } from "./reflectorSurface";
import { Transform } from "./shared";
import { PlacardConfig, TextConfig } from "./text";
import { PortalConfig } from "./portal";

import { TerrainConfig } from "./terrain";
import { Timestamp } from "db";
import { NftConfig } from "./nftConfig";
import { WaterConfig } from "./water";
import { VideoConfig } from "./video";
import { AudioConfig } from "./audio";
export enum ElementType {
  model = "model",
  text = "text",
  placard = "placard",
  image = "image",
  light = "light",
  group = "group",
  video = "video",
  audio = "audio",
  broadcastZone = "broadcast zone",
  reflectorSurface = "reflector surface",
  root = "root",
  portal = "portal",
  terrain = "terrain",
  nft = "nft",
  water = "water",
}

export type ConcretElementType = Exclude<
  ElementType,
  ElementType.root | ElementType.group
>;
export interface BaseElementConfig {
  elementType: ElementType;
  name?: string;
  locked?: boolean;
  active: boolean;
  deleted?: boolean;
  transform?: Transform;
  model?: ModelConfig;
  text?: TextConfig;
  image?: ImageConfig;
  light?: LightConfig;
  video?: VideoConfig;
  audio?: AudioConfig;
  reflectorSurface?: ReflectorSurfaceConfig;
  portal?: PortalConfig;
  terrain?: TerrainConfig;
  placard?: PlacardConfig;
  nft?: NftConfig;
  water?: WaterConfig;
}

export interface ModelElementConfig extends BaseElementConfig {
  elementType: ElementType.model;
  model: ModelConfig;
}

export interface TextElementConfig extends BaseElementConfig {
  elementType: ElementType.text;
  text: TextConfig;
}
export interface PlacardElementConfig extends BaseElementConfig {
  elementType: ElementType.placard;
  placard: PlacardConfig;
}
export interface GroupElementConfig extends BaseElementConfig {
  elementType: ElementType.group;
}

export interface ImageElementConfig extends BaseElementConfig {
  elementType: ElementType.image;
  image: ImageConfig;
}

export interface LightElementConfig extends BaseElementConfig {
  elementType: ElementType.light;
  light: LightConfig;
}

export interface VideoElementConfig extends BaseElementConfig {
  elementType: ElementType.video;
  video: VideoConfig;
}
export interface AudioElementConfig extends BaseElementConfig {
  elementType: ElementType.audio;
  audio: AudioConfig;
}

export interface ReflectorSurfaceElementConfig extends BaseElementConfig {
  elementType: ElementType.reflectorSurface;
  reflectorSurface: ReflectorSurfaceConfig;
}
export interface PortalElementConfig extends BaseElementConfig {
  elementType: ElementType.portal;
  portal: PortalConfig;
}

export interface TerrainElementConfig extends BaseElementConfig {
  elementType: ElementType.terrain;
  terrain: TerrainConfig;
}

export interface NftElementConfig extends BaseElementConfig {
  elementType: ElementType.nft;
  nft: NftConfig;
}

export interface WaterElementConfig extends BaseElementConfig {
  elementType: ElementType.water;
  water: WaterConfig;
}

export type ElementConfig = {
  lastActive?: Timestamp;
  hideOnMobile?: boolean;
} & (
  | GroupElementConfig
  | ModelElementConfig
  | TextElementConfig
  | LightElementConfig
  | VideoElementConfig
  | AudioElementConfig
  | ImageElementConfig
  | ReflectorSurfaceElementConfig
  | PortalElementConfig
  | TerrainElementConfig
  | PlacardElementConfig
  | NftElementConfig
  | BaseElementConfig
  | WaterElementConfig
);

export type ElementNode = {
  parentId?: string;
  children: ElementNode[];
} & ElementConfig;
