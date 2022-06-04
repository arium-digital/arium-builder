import { AudioQuality, VideoResolution } from "communicationTypes";
import { useMemo } from "react";
import { ControlsSettings } from "../componentTypes";
import {
  useQuery,
  useQueryParam,
  useNumberQueryParam,
  useBooleanQueryParam,
} from "../../libs/pathUtils";
import { PeersSettings } from "../../types";
import { METADATA_KEYS } from "../../hooks/usePeersMetadata";

export const SpaceRouteKeys = {
  x: "x",
  y: "y",
  z: "z",
  lx: "lx",
  ly: "ly",
  lz: "lz",
  portalTo: "portalTo",
  bodyColor: "body-color",
  avatarScale: "avatar-scale",
  videoResolution: "video-res",
  micQuality: "mic-quality",
  profilePhoto: "profile-photo",
  eventSlug: "event",
  invite: "invite",
};

export const useSpaceQueryParams = () => {
  const queryParams = useQuery();
  const externalVideo = useQueryParam("video", queryParams);
  const videoResolution = useQueryParam(
    SpaceRouteKeys.videoResolution,
    queryParams
  ) as VideoResolution | undefined;
  const micQuality = useQueryParam(SpaceRouteKeys.micQuality, queryParams) as
    | AudioQuality
    | undefined;
  const initialX = useNumberQueryParam(SpaceRouteKeys.x, queryParams);
  const initialY = useNumberQueryParam(SpaceRouteKeys.y, queryParams);
  const initialZ = useNumberQueryParam(SpaceRouteKeys.z, queryParams);
  const initialLookAtX = useNumberQueryParam(SpaceRouteKeys.lx, queryParams);
  const initialLookAtY = useNumberQueryParam(SpaceRouteKeys.ly, queryParams);
  const initialLookAtZ = useNumberQueryParam(SpaceRouteKeys.lz, queryParams);
  const dontRender = useQueryParam("dontRender", queryParams);
  const moveSpeed = useNumberQueryParam("moveSpeed", queryParams);
  const dragSpeed = useNumberQueryParam("dragSpeed", queryParams);
  const turnSpeed = useNumberQueryParam("turnSpeed", queryParams);
  const gravity = useNumberQueryParam("gravity", queryParams);
  const jumpSpeed = useNumberQueryParam("jumpSpeed", queryParams);
  const disableCollisions = useBooleanQueryParam(
    "disableCollisions",
    queryParams
  );
  const testTransport = useBooleanQueryParam("testTransport", queryParams);
  const invisible = useBooleanQueryParam("invisible", queryParams);
  const documentation = useBooleanQueryParam("documentation", queryParams);
  const eventSlug = useQueryParam(SpaceRouteKeys.eventSlug, queryParams);

  const peerSettingsOverride: PeersSettings = {
    maxVisiblePeers: useNumberQueryParam("maxVisiblePeers", queryParams),
    maxVideoPeers: useNumberQueryParam("maxVideoPeers", queryParams),
    maxAudioPeers: useNumberQueryParam("maxAudioPeers", queryParams),
    maxTweenedPeers: useNumberQueryParam("maxTweenedPeers", queryParams),
    maxPeerMediaDistance: useNumberQueryParam(
      "maxPeerMediaDistance",
      queryParams
    ),
  };

  const disableGroundDetection = useBooleanQueryParam(
    "disableGroundDetection",
    queryParams
  );

  const name = useQueryParam("name", queryParams);

  const bodyColor = useQueryParam(SpaceRouteKeys.bodyColor, queryParams);
  const profilePhoto = useQueryParam(SpaceRouteKeys.profilePhoto, queryParams);
  const avatarScale = useQueryParam(SpaceRouteKeys.avatarScale, queryParams);

  const inviteId = useQueryParam(SpaceRouteKeys.invite, queryParams);

  const autoEnter = useQueryParam("auto-enter", queryParams) === "true";

  const targetSlug = useQueryParam(SpaceRouteKeys.portalTo, queryParams);

  const controlsSettings: ControlsSettings = {
    movementSpeed: moveSpeed,
    dragSpeed,
    turnSpeed,
    disableCollisions,
    disableGroundDetection,
    gravity,
    jumpSpeed,
  };

  const peerMetadata = useMemo(
    () => ({
      [METADATA_KEYS.name]: name,
      [METADATA_KEYS.bodyColor]: bodyColor,
      [METADATA_KEYS.avatarScale]: avatarScale,
      [METADATA_KEYS.photo]: profilePhoto,
    }),
    [name, bodyColor, avatarScale, profilePhoto]
  );

  const render = useMemo(() => dontRender !== "true", [dontRender]);

  return {
    externalVideo,
    initialX,
    initialY,
    initialZ,
    initialLookAtX,
    initialLookAtY,
    initialLookAtZ,
    render,
    controlsSettings,
    peerSettingsOverride,
    peerMetadata,
    testTransport,
    invisible,
    bodyColor,
    autoEnter,
    documentation,
    targetSlug,
    videoResolution,
    micQuality,
    inviteId,
    eventSlug,
  };
};

export type SpaceQueryParams = ReturnType<typeof useSpaceQueryParams>;
