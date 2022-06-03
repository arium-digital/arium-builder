import { Concrete, useConfigOrDefault } from "../hooks/spaceHooks";
import {
  LightConfig,
  LightShadowConfig,
  DirectionalLightSettings,
  SpotLightSettings,
  EnvironmentConfig,
  PositionalAudioConfig,
  PlaySurfaceConfig,
  PlaySettings,
  LiveStreamConfig,
  FlatShapeConfig,
  CircleConfig,
  RectangleConfig,
  SpawnConfig,
  MaterialConfig,
  PhongConfig,
  SpaceMeta,
  PlaySurfacesConfig,
  ElementType,
  TextConfig,
  Transform,
  FileLocation,
  Side,
  ModelConfig,
} from "../spaceTypes";
import { PhysicsSettings } from "components/componentTypes";
import { GraphicsConfig } from "../spaceTypes/environment";
import { LightKind } from "../spaceTypes/light";
import { FrameConfiguration } from "../spaceTypes/image";

import {
  ExperimentalCameraConfig,
  PeersSettings,
  SpaceSettings,
} from "../types";
import {
  AudioElementConfig,
  GroupElementConfig,
  LightElementConfig,
  ModelElementConfig,
  PortalElementConfig,
  TerrainElementConfig,
} from "spaceTypes/Element";
import { TerrainConfig } from "spaceTypes/terrain";
import { HasFrameConfig } from "spaceTypes/text";
import {
  DEFAULT_CAMERA_FAR,
  DEFAULT_CAMERA_FOV,
  DEFAULT_FAR_TRANSITION_SPEED_SECONDS,
  DEFAULT_FOV_TRANSITION_SPEED_SECONDS,
} from "config";
import {
  CurvedMediaGeometryConfig,
  VideoPlaySettings,
  VideoThumbnailConfig,
} from "spaceTypes/video";
import { NftType } from "../../shared/nftTypes";
import { defaultPortalConfig } from "spaceTypes/portal";
import { SpaceEffects } from "components/PostProcessing/types";
import { defaultAudioConfig } from "./useDefaultNewElements";

export const DEFAULT_MAX_CONSUMER_DISTANCE = 400;
export const DEFAULT_MAX_VISIBLE_PEERS = 50;
export const DEFAULT_MAX_TWEENED_PEERS = 20;
export const DEFAULT_MAX_VIDEO_PEERS = 12;
export const DEFAULT_MAX_AUDIO_PEERS = 12;
export const DEFAULT_IMAGE_WIDTH = 3;
export const DEFAULT_VIDEO_WIDTH = 3;

export const defaultPeersSettings = (): PeersSettings => ({
  maxPeerMediaDistance: DEFAULT_MAX_CONSUMER_DISTANCE,
  maxVisiblePeers: DEFAULT_MAX_VISIBLE_PEERS,
  maxTweenedPeers: DEFAULT_MAX_TWEENED_PEERS,
  maxAudioPeers: DEFAULT_MAX_AUDIO_PEERS,
  maxVideoPeers: DEFAULT_MAX_VIDEO_PEERS,
});

export const defaultSpaceSettings = (): SpaceSettings => ({
  maxFileUploadSize: 200000000,
  peers: defaultPeersSettings(),
  capacity: 15,
  routerGroup: "shared",
});

export const defaultSpaceMeta = (): SpaceMeta => ({});

export const defaultEnvironmentConfig = (): EnvironmentConfig => ({
  showGrid: false,
  ambientLightIntensity: 0.5,
  ambientLightColor: "0xfff",
  fogColor: "#cdcdcd",
  fogNear: 10,
  fogFar: 300,
});

export const useEnvironmentConfigOrDefault = (
  config: EnvironmentConfig | undefined
) => useConfigOrDefault(config, defaultEnvironmentConfig);

export const defaultLightShadowConfig = (): LightShadowConfig => ({
  mapSize: 512,
  bias: -0.00001,
  cameraFar: 3500,
  cameraSize: 150,
});

export const useDefaultLightShadowConfigOrDefault = (
  config: LightShadowConfig | undefined
) => useConfigOrDefault(config, defaultLightShadowConfig);

export const defaultTextSize = 100;

export const defaultText = (): TextConfig => ({
  text: "",
  frontColor: "#000000",
  size: defaultTextSize,
  height: 1,
  textGeometry: {},
});

export const defaultPlacardTextSize = 16;

export const defaultDirectionalConfig = (): DirectionalLightSettings => ({
  position: {
    x: 0,
    y: 2,
    z: 0,
  },
  target: {
    x: 0,
    y: 0,
    z: 0,
  },
  castShadow: false,
});

export const useDirectionalLightConfigOrDefault = (
  config: DirectionalLightSettings | undefined
) => useConfigOrDefault(config, defaultDirectionalConfig);

export const defaultSpotLightConfig = (): SpotLightSettings => ({
  angle: Math.PI / 3,
  distance: 0,
  penumbra: 0.0,
  decay: 1,
});

export const useSpotLightConfigOrDefault = (
  config: SpotLightSettings | undefined
) => useConfigOrDefault(config, defaultSpotLightConfig);

const DEFAULT_ROLLOF_FACTOR = 2;
const DEFAULT_REF_DISTANCE = 5;
const DEFAULT_MAX_DISTANCE = 10000;
const DEFAULT_DISTANCE_MODEL = "exponential";

export const DEFAULT_VIDEO_THUMBNAIL_WIDTH = 400;

export const defaultVideoThumbnailConfig = (): Concrete<VideoThumbnailConfig> => ({
  time: 0,
  width: DEFAULT_VIDEO_THUMBNAIL_WIDTH,
});

export const defaultVideoSoundConfig = (): PositionalAudioConfig => ({
  distanceModel: DEFAULT_DISTANCE_MODEL,
  rollOffFactor: DEFAULT_ROLLOF_FACTOR,
  refDistance: DEFAULT_REF_DISTANCE,
  maxDistance: DEFAULT_MAX_DISTANCE,
});

export const DEFAULT_CROP_TOP = 0;
export const DEFAULT_CROP_BOTT0M = 1;
export const DEFAULT_CROP_LEFT = 0;
export const DEFAULT_CROP_RIGHT = 1;

export const DEFAULT_VIDEO_PLAY_SURFACE_SIDE: Side = "Double Sided";

export const defaultSurfaceConfig = (): PlaySurfaceConfig => ({
  cropTop: DEFAULT_CROP_TOP,
  cropBottom: DEFAULT_CROP_BOTT0M,
  cropLeft: DEFAULT_CROP_LEFT,
  cropRight: DEFAULT_CROP_RIGHT,
  side: DEFAULT_VIDEO_PLAY_SURFACE_SIDE,
});

export const defaultPlaySurfacesConfig = (): PlaySurfacesConfig => ({
  "0": defaultSurfaceConfig(),
});

export const DEFAULT_CURVE_ANGLE = 30;
export const DEFAULT_CURVE_ORIENTATION = "horizontal";

export const defaultCurvedMediaGeometryConfig = (): Concrete<CurvedMediaGeometryConfig> => ({
  curveAngle: DEFAULT_CURVE_ANGLE,
  orientation: DEFAULT_CURVE_ORIENTATION,
});

export const defaultPlaneExtension = 0.5;

export const DEFAULT_MAX_VIDEO_PLAY_DISTANCE = 40;

export const defaultPlaySettings = (): Concrete<PlaySettings> => ({
  maxDistance: DEFAULT_MAX_VIDEO_PLAY_DISTANCE,
  syncToTimeline: false,
});

export const defaultVideoPlaySettings = (): Concrete<VideoPlaySettings> => ({
  ...defaultPlaySettings(),
  auto: false,
});

export const defaultLiveStreamVideoConfig = (): LiveStreamConfig => ({});

export const DEFAULT_PLAY_SURFACES_TYPE = "plane";

// export const legacyDefaultVideoConfig = (): LegacyVideoConfig => ({
//   width: DEFAULT_VIDEO_WIDTH,
//   type: "stored video",
//   sound: defaultVideoSoundConfig(),
//   playSettings: defaultPlaySettings(),
//   playSurfacesType: DEFAULT_PLAY_SURFACES_TYPE,
//   playSurfaces: {
//     main: defaultSurfaceConfig(),
//   },
// });

export const defaultCircleConfig = (): CircleConfig => ({
  radius: 5,
  segments: 20,
});

export const defaultRectangleConfig = (): RectangleConfig => ({
  width: 2,
  height: 2,
});

export const defaultFlatShapeConfig = (): FlatShapeConfig => ({
  kind: "circle",
  circle: {
    radius: 5,
    segments: 20,
  },
});

export const defaultSpawnConfig = (): SpawnConfig => ({
  // @ts-itnore
  origin: {
    x: 0,
    y: 0,
    z: 0,
  },
  lookAt: {
    x: 0,
    y: 0,
    z: -100,
  },
  radius: 10,
});

export const defaultGraphicsConfig = (): GraphicsConfig => ({
  shadowMapType: "PCFSoftShadowMap",
  antialias: true,
});

export const getDefaultWelcomeHTML = (): string => `<p>Arium is the 3D video chat platform for social events. Host, share, and attend gatherings in a 3D space as if you were in the same room together. In Arium, you and your guests will…</p>
          <ul>
            <li><strong>Share an experience in a 3D space:</strong> Meet friends and explore the world of Arium together.</li>
            <li><strong>Flow naturally between conversations and have serendipitous interactions:</strong> No need to hassle with breakout rooms. If you want to talk to someone in Arium, you can simply walk over to them - making even the largest virtual events feel fun and natural.</li>
            <li><strong>Make it your own:</strong> Customize the space for your community and your event. Project videos on the wall, invite your favorite DJs for a set, and dim the lights when it's time to dance!</li>
          </ul>
`;

export const defaultPhongConfig = (): PhongConfig => ({
  bumpMapScale: 0.2,
  reflectivity: 0,
  shininess: 0,
});

export const defaultBasicMaterialConfig = (): MaterialConfig => ({
  color: "0xffffff",
  materialType: "basic",
  opacity: 1,
  transparent: false,
});

export const defaultMaterialConfig = (): MaterialConfig => ({
  color: "0xffffff",
  materialType: "lambert",
  opacity: 1,
  transparent: false,
  phong: undefined,
  textureRepeatX: 1,
  textureRepeatY: 1,
});

export const DEFAULT_LIGHT_KIND = LightKind.directional;
export const DEFAULT_LIGHT_INTENSITY = 0.5;

export const defaultLightConfig = (): LightConfig => ({
  color: "0xffffff",
  kind: DEFAULT_LIGHT_KIND,
  intensity: DEFAULT_LIGHT_INTENSITY,
  directional: defaultDirectionalConfig(),
  distance: 0.0,
  decay: 2,
  showHelper: false,
});

export const defaultFrameConfig = (): Concrete<FrameConfiguration> => ({
  border: 0,
  depth: 0.2,
  material: {
    materialType: "basic",
    color: "#000",
  },
});

export const defaultHasFrameConfig = (): Concrete<HasFrameConfig> => ({
  hasFrame: true,
  frameConfig: defaultFrameConfig(),
});

const placeHolderImageUrl =
  "https://dummyimage.com/600x400/eee/aaa.png&text=image+placeholder";

export const placeHolderVideoUrl =
  "https://dummyimage.com/600x400/eee/aaa.png&text=video+placeholder";

export const defaultImageFile = (): FileLocation => ({
  fileType: "external",
  url: placeHolderImageUrl,
});

export const DEFAULT_IN_SPACE_IMAGE_RESOLUTION = 1280;
export const DEFAULT_IN_SPACE_IMAGE_QUALITY = 80;

export const placeholderImageUrl = (text: string) =>
  `https://dummyimage.com/600x400/eee/aaa.png&text=${text}`;

export const placeholderImageFile = (text: string): FileLocation => ({
  fileType: "external",
  url: placeholderImageUrl(text),
});

export const defaultTerrainConfig = (): TerrainConfig => ({
  maxHeight: 10,
  minHeight: 0,
  width: 64,
  height: 64,
  heightSegments: 64,
  widthSegments: 64,
  isGround: true,
});

export const defaultTransform = (): Required<Transform> => ({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
});

export const DEFAULT_NFT_TYPE: NftType = "ethereum";
export const DEFAULT_SUPERRARE_VERSION = "v2";

export const defaultModelElement = (): ModelElementConfig => ({
  name: `model`,
  elementType: ElementType.model,
  active: true,
  model: defaultModel(),
});

export const defaultTerrainElement = (): TerrainElementConfig => ({
  name: `terrain`,
  elementType: ElementType.terrain,
  active: true,
  terrain: defaultTerrainConfig(),
});

export const defaultPortalElement = (): PortalElementConfig => ({
  name: `portal`,
  elementType: ElementType.portal,
  active: true,
  portal: defaultPortalConfig(),
});

export const defaultLightElement = (): LightElementConfig => ({
  name: `light`,
  elementType: ElementType.light,
  active: true,
  light: defaultLightConfig(),
});

export const defaultGroupElement = (): GroupElementConfig => ({
  name: `group`,
  elementType: ElementType.group,
  active: true,
});

export const defaultAudioElement = (): AudioElementConfig => ({
  name: "audio",
  active: true,
  audio: defaultAudioConfig(),
  elementType: ElementType.audio,
});

export const DEFAULT_MOVEMENT_SPEED = 5;
export const DEFAULT_JUMP_SPEED = 0.5;
export const DEFAULT_GRAVITY = 5;

export const defaultPositionalAudioConfig = (): Concrete<PositionalAudioConfig> => ({
  volume: 100,
  mode: "spatial",
  distanceModel: "exponential",
  maxDistance: 50,
  refDistance: 3,
  rollOffFactor: 1.5,
});

export const defaultPhysicsSettings = (): PhysicsSettings => ({
  movementSpeed: DEFAULT_MOVEMENT_SPEED,
  jumpSpeed: DEFAULT_JUMP_SPEED,
  gravity: DEFAULT_GRAVITY,
});

export const defaultExperimentalCameraSettings = (): Required<ExperimentalCameraConfig> => ({
  fov: DEFAULT_CAMERA_FOV,
  far: DEFAULT_CAMERA_FAR,
  fovTransitionSpeed: DEFAULT_FOV_TRANSITION_SPEED_SECONDS,
  farTransitionSpeed: DEFAULT_FAR_TRANSITION_SPEED_SECONDS,
});

export const defaultModelFile = (): FileLocation => ({
  fileType: "stored",
  fileLocation: "standardAssets",
  fileName: "models/ReflectiveMonkeyHead.glb",
});

export const defaultModel = (): ModelConfig => ({
  bundledMaterial: true,
  materialConfig: undefined,
  envMapIntensity: 0.1,
  shadow: {
    cast: false,
    receive: false,
  },
  isCollidable: false,
  isGround: false,
  modelFile: defaultModelFile(),
});

export const defaultSpaceEffects = (): SpaceEffects => ({
  postProcessing: {
    Bloom: {
      enabled: false,
      luminanceThreshold: 0.9,
      luminanceSmoothing: 0.025,
      intensity: 1,
      width: 400,
      height: 400,
    },
  },
});
