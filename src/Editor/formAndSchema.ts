import {
  ElementType,
  MaterialConfig,
  ModelConfig,
  TextConfig,
  VideoConfig,
  StoredVideoConfig,
  LiveStreamConfig,
} from "../spaceTypes";
import * as yup from "yup";
import { PortalConfig } from "spaceTypes/portal";

export type HandleChangedHandler<T> = <K extends keyof T>(
  prop: K,
  value: T[K]
) => void;

export const IVector3Schema = yup.object({
  x: yup.number(),
  y: yup.number(),
  z: yup.number(),
});

export const TransformSchema = yup.object({
  position: IVector3Schema.optional(),
  rotation: IVector3Schema.optional(),
  scale: IVector3Schema.optional(),
});

const definedBool = () => yup.bool();

export const colorDefinition = () => yup.string();

export const FileLocationSchema = yup.object({
  fileName: yup.string(),
  fileLocation: yup
    .mixed<"spaceAssets" | "standardAssets">()
    .oneOf(["spaceAssets", "standardAssets"]),
  spaceId: yup.string().when("fileLocation", {
    is: "spaceAssets",
    then: yup.string(),
  }),
  url: yup.string().url(),
});

export const PhongConfigSchema = yup.object({
  specularColor: colorDefinition().optional(),
  shininess: yup.number().optional(),
  reflectivity: yup.number().optional(),
  bumpScale: yup.number().optional(),
});

export const MaterialConfigSchema = yup.object({
  color: colorDefinition(),
  transparent: definedBool(),
  opacity: yup.number().min(0).max(1),
  repeatNumber: yup.number().min(0),
  materialType: yup
    .mixed<"phong" | "lambert" | "basic" | "standard">()
    .oneOf(["phong", "lambert", "basic", "standard"]),
  phong: PhongConfigSchema.optional(),
});

export const ShadowConfigSchema = yup.object({
  cast: yup.boolean(),
  receive: yup.boolean(),
});

export const ModelSchema = yup.object({
  modelFile: FileLocationSchema,
  isGround: yup.boolean(),
  isCollidable: yup.boolean(),
  bundledMaterial: yup.boolean(),
  materialConfig: yup
    .mixed<MaterialConfig | undefined>()
    .when("bundledMaterial", {
      is: false,
      then: MaterialConfigSchema.optional(),
      else: MaterialConfigSchema.strip(true),
    }),
  shadow: ShadowConfigSchema,
});

export const TextSchema = yup.object({
  frontColor: colorDefinition(),
  size: yup.number(),
  height: yup.number(),
  shadow: ShadowConfigSchema,
});

const VideoSoundSchema = yup.object({
  refDistance: yup.number(),
  rollOffFactor: yup.number(),
});

const StoredVideoFilesSchema = yup.object({
  webm: FileLocationSchema.optional(),
  mp4: FileLocationSchema.optional(),
});

const LiveStreamSchema = yup.object({
  muxPlaybackId: yup.string().required(),
});

export const VideoSchema = yup.object({
  scale: yup.number(),
  sound: VideoSoundSchema,
  type: yup.mixed().oneOf(["stream", "stored video"]),
  storedVideos: yup.mixed<StoredVideoConfig | undefined>().when("type", {
    is: "stored video",
    then: StoredVideoFilesSchema,
    else: StoredVideoFilesSchema.strip(true),
  }),
  liveStream: yup.mixed<LiveStreamConfig | undefined>().when("type", {
    is: "stream",
    then: LiveStreamSchema,
    else: LiveStreamSchema.strip(true),
  }),
});

export const PortalSchema = yup.object({
  radius: yup.number(),
  toAnotherSpace: yup.boolean(),
  targetSpaceId: yup.string().when("toAnotherSpace", {
    is: true,
    then: yup.string().required(),
    else: yup.string().strip(true),
  }),
});

export const ElementSchema = yup.object({
  active: yup.bool(),
  name: yup.string().required(),
  transform: TransformSchema.optional(),
  elementType: yup.mixed<ElementType>().oneOf(Object.values(ElementType)),
  model: yup.mixed<ModelConfig | undefined>().when("elementType", {
    is: "model",
    then: ModelSchema.optional(),
    else: ModelSchema.strip(true),
  }),
  text: yup.mixed<TextConfig | undefined>().when("elementType", {
    is: "text",
    then: TextSchema.optional(),
    else: TextSchema.strip(true),
  }),
  video: yup.mixed<VideoConfig | undefined>().when("elementType", {
    is: "video",
    then: VideoSchema.optional(),
    else: VideoSchema.strip(true),
  }),
  portal: yup.mixed<PortalConfig | undefined>().when("elementType", {
    is: "portal",
    then: PortalSchema.optional(),
    else: PortalSchema.strip(true),
  }),
});

export const EnvironmentConfigSchema = yup.object({
  skyBox: FileLocationSchema.optional(),
  ambientLightIntensity: yup.number().optional(),
  showGrid: yup.boolean().optional(),
});

export const ThemeSchema = yup.object({});

export const SpaceSettingsSchema = yup.object({
  welcomeHTML: yup.string(),
});
