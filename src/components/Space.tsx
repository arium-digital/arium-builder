import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import SceneContainer from "./SceneContainer";

import { useUserMediaAndProduce } from "../hooks/userMedia/useUserMediaAndProduce";

import { HasAuthenticatedAuthState } from "../hooks/auth/useAuthentication";
import { useConfigOrDefault } from "../hooks/spaceHooks";
import { defaultSpaceSettings } from "../defaultConfigs";
// import { PeerToPeerCommunicators } from "../communicationTypes";
import { IJoystickUpdateEvent, SpaceProps } from "./componentTypes";
import useUpdateRemotePlayerLocation from "../hooks/useUpdateRemotePlayerPosition";
import useActivePresence, {
  useUpdateActivePresence,
} from "../hooks/useActivePresence";
import { useMetadata, usePeerMetadata } from "../hooks/usePeersMetadata";
import { BehaviorSubject, Subject } from "rxjs";
import {
  useBehaviorSubjectFromCurrentValue,
  useCurrentValueFromBehaviorSubject,
  useCurrentValueFromObservable,
} from "../hooks/useObservable";
import useSessionPaths from "../hooks/useSessionPaths";
import { useSpaceSettings } from "../hooks/useSpaceSettings";
import {
  usePeerDistanceCalculations,
  usePeerLocations,
} from "../hooks/usePlayerLocations";
import { useBroadcasters } from "../hooks/useBroadcasters";
import usePeersSettings from "../hooks/usePeersSettings";
import { useTransports } from "../hooks/useTransports";
import { useJoinSpace } from "../hooks/useJoinSpace";
import { useAudioAndListener } from "../hooks/useListener";
import { ObservedConsumer } from "../communicationTypes";
import { usePeerPositionalAudio } from "../hooks/usePeerPositionalAudio";
import useEnablePositionalAudio from "../hooks/useEnableSpatialAudio";

import styles from "../css/space.module.scss";
import { useObserveAndSendDeviceOrientation } from "../hooks/useDeviceOrientation";
import { LoadingSpinContainer } from "./UserInterface/LoadingSpinAnimation";
import useSpaceAnalytics from "hooks/useSpaceAnalytics";
import { SpaceAccessContext } from "hooks/auth/useSpaceAccess";
import Chat from "./Chat";
import useServerTimeOffset from "hooks/useServerTimeOffset";
import EntranceFlow from "./UserInterface/EntranceFlow";
import { useCanvasAndModalContext } from "hooks/useCanvasAndModalContext";
import useControlsSettings from "hooks/useControlsSettings";
import { useGoogleAnalyticsBeacon } from "hooks/useGoogleAnalyticsBeacon";
import clsx from "clsx";
import {
  useProfileSetter,
  useUserProfile,
} from "./UserInterface/Profile/hooks";
import { SpaceContextType } from "types";
import { useRouter } from "next/router";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import { useSelfAvatar } from "./Consumers/SelfAvatar";
import useTheme from "hooks/useTheme";
import { useAvatarMeshes } from "./Consumers/AvatarMesh";
import { useProducingPeers } from "hooks/userMedia/useProducingPeers";
import useCaptureScreenshareAndProduce from "hooks/userMedia/useCaptureScreenshareAndProduce";
import { useConsumers } from "./Consumers/hooks/useConsumers";
import useReloadIfUserIdChanged from "hooks/auth/useReloadIfUserIdChanged";
import { AnimatedAriumLogo } from "./AnimatedAriumLogo";
import { useElementsLoadedProgress } from "./Elements/Tree/useLoadedState";

export type SpaceComponentProps = SpaceProps &
  HasAuthenticatedAuthState & { hideUI?: boolean };

export const Space = ({
  authState,
  spaceSlugFromPath,
  spaceId,
  externalVideo,
  initialX,
  initialY,
  initialZ,
  initialLookAtX,
  initialLookAtY,
  initialLookAtZ,
  render = true,
  controlsSettings: controlSettingsFromProps,
  invisible,
  UserInterface,
  peerMetadata: peerMetadataFromProps,
  videoResolution = "qvga",
  micQuality = "sd",
  autoEnter,
  muted,
  fullScreen = true,
  disableChat: disableChatFromProps = false,
  disableUserMediaControls: disableUserMediaControlsFromProps = false,
  autoInitialize = false,
  spaceMetadata,
  documentation = false,
  hideUI,
  eventSlug,
  spaceSlug,
  canEdit,
  playerLocation$,
  updatePlayerLocation,
  inviteId,
}: SpaceProps & HasAuthenticatedAuthState & { hideUI?: boolean }) => {
  const { userId, authenticated, user } = authState;

  const authenticated$ = useBehaviorSubjectFromCurrentValue(
    authState.authenticated
  );

  const spaceId$ = useBehaviorSubjectFromCurrentValue(spaceId);

  const spaceAccessContext = useContext(SpaceAccessContext);

  const canInviteToEdit =
    !!spaceAccessContext?.editor || !!spaceAccessContext?.isAdmin;

  const owner = !!spaceAccessContext?.owner;
  const editor = !!spaceAccessContext?.editor;
  // const { owner, editor } = useSpaceAccess({
  //   userId,
  //   spaceId: spaceId || "",
  //   isAdmin,
  // });

  useEffect(() => {
    document.body.className = styles.spaceBody;

    return () => {
      document.body.className = "";
    };
  }, []);

  const [
    externalVideoElement,
    setExternalVideoElement,
  ] = useState<HTMLVideoElement>();

  const externalVideoRef = useCallback((node: HTMLVideoElement) => {
    // console.log("setting external", node);
    setExternalVideoElement(node);
  }, []);

  const [initialized, setInitialized] = useState<boolean>(autoInitialize);

  const initialized$ = useBehaviorSubjectFromCurrentValue(initialized);

  const [enteredSpaceSubject] = useState(() => new BehaviorSubject(false));
  // legacy entered space state
  const enteredSpace = useCurrentValueFromBehaviorSubject(enteredSpaceSubject);

  useEffect(() => {
    if (autoEnter) {
      setInitialized(true);
      enteredSpaceSubject.next(true);
    }
  }, [autoEnter, initialized, enteredSpaceSubject]);

  const spaceSettings = useSpaceSettings({
    authenticated,
    spaceId,
  });

  const disableChat = useMemo(() => {
    if (!!spaceSettings?.disableChat) return true;
    if (!!disableChatFromProps) return true;
    return false;
  }, [disableChatFromProps, spaceSettings?.disableChat]);

  const disableUserMediaControls = useMemo(() => {
    if (!!spaceSettings?.disableUserMediaControls) return true;
    if (!!disableUserMediaControlsFromProps) return true;
    return false;
  }, [
    disableUserMediaControlsFromProps,
    spaceSettings?.disableUserMediaControls,
  ]);

  const enterSpace = useCallback(() => {
    enteredSpaceSubject.next(true);
  }, [enteredSpaceSubject]);

  useGoogleAnalyticsBeacon(spaceId);

  const userId$ = useBehaviorSubjectFromCurrentValue(userId);

  const { sessionId$, routerId$, joinStatus$ } = useJoinSpace({
    userId$,
    spaceId$,
    initialized$,
    enteredSpace$: enteredSpaceSubject,
    authenticated: authState.authenticated,
  });

  useReloadIfUserIdChanged({
    userId: authState.userId,
    attemptedToJoin: initialized,
  });

  const joinStatus = useCurrentValueFromObservable(joinStatus$, undefined);
  const sessionId = useCurrentValueFromObservable(sessionId$, undefined);

  useUpdateActivePresence({
    invisible,
    authenticated,
    sessionId,
    userId,
    spaceId,
  });

  const { metadata, setMetadata } = useMetadata({
    userId$,
    sessionId$,
    spaceId$,
    intialMetadata: peerMetadataFromProps,
  });

  const userProfile = useUserProfile(user);

  const userName$ = useBehaviorSubjectFromCurrentValue(
    userProfile?.displayName
  );

  const profileSetter = useProfileSetter({
    userProfile,
    userId: user?.uid,
    setPeerMetadata: setMetadata,
  });

  const { controlsSettings, setKeyboardControlsDisabled } = useControlsSettings(
    {
      spaceId,
      controlSettingsFromProps,
    }
  );

  const spaceSettingsOrDefault = useConfigOrDefault(
    spaceSettings,
    defaultSpaceSettings
  );

  const sessionPaths$ = useSessionPaths({
    sessionId,
    userId,
    authenticated,
  });

  const { listener$, audioContext$ } = useAudioAndListener({
    initialized$,
    muted,
  });
  const audioContext = useCurrentValueFromObservable(audioContext$, undefined);

  const transports$ = useTransports({
    sessionPaths$,
    routerId$,
  });

  const {
    producer: producingTransport$,
    consumer: consumerTransport$,
  } = transports$;

  const enteredSpace$ = useBehaviorSubjectFromCurrentValue(enteredSpace);

  const userMedia = useUserMediaAndProduce({
    initialized,
    invisible,
    videoResolution,
    micQuality: micQuality,
    useExternalVideo: !!externalVideo,
    externalVideoElement,
    sessionPaths$,
    producingTransport$,
    produce$: enteredSpace$,
    spaceId$,
  });

  const screenShare = useCaptureScreenshareAndProduce({
    producingTransport$,
    sessionPaths$,
    spaceId$,
  });

  const { grantAccessRequestForWebcamAndMic } = userMedia;

  const initialize = useCallback(
    (skipAccess: boolean) => {
      if (!skipAccess) grantAccessRequestForWebcamAndMic();
      setInitialized(true);
    },
    [grantAccessRequestForWebcamAndMic]
  );

  useUpdateRemotePlayerLocation({
    spaceId$,
    userId$,
    sessionId$,
    invisible,
    enteredSpace$,
    playerLocation$,
  });

  const serverTimeOffset$ = useServerTimeOffset();

  const activeSessions$ = useActivePresence({
    spaceId$,
    sessionId$,
    serverTimeOffset$,
  });
  const peerPositions$ = usePeerLocations({
    spaceId$,
    sessionId$,
    activeSessions$,
  });

  const {
    broadcasters$: broadcastingPeers$,
    controls: broadcastingControls,
  } = useBroadcasters({
    canManuallyBroadcast: canEdit,
    activePresence$: activeSessions$,
    sessionId$,
    spaceId$,
    userId$,
  });

  const { peersSettings$ } = usePeersSettings({
    spaceSettings: spaceSettingsOrDefault,
  });

  useSpaceAnalytics({
    spaceId,
    spaceSlug,
    eventSlug,
    enteredSpace,
    userInfo: { user: user || undefined, authenticated, owner, editor },
    metadata,
  });

  const {
    distancesByPeer$,
    allVisiblePeers$,
    peersToSee$,
    peersToHear$,
  } = usePeerDistanceCalculations({
    playerLocation$,
    activeSessions$,
    peerPositions$,
    broadcastingPeers$,
    peersSettings$,
  });

  const producingPeers = useProducingPeers({ spaceId$ });

  // useConsumersToRequest({
  //   validPeersSortedByDistance$: peersToHear$,
  //   peersSettings$,
  //   sessionPaths$,
  //   spaceId$,
  //   kind: "webcamAudio",
  //   muted,
  // });

  // useConsumersToRequest({
  //   validPeersSortedByDistance$: peersToSee$,
  //   peersSettings$,
  //   sessionPaths$,
  //   spaceId$,
  //   kind: "webcamVideo",
  // });

  const [consumers$] = useState(new Subject<ObservedConsumer>());

  const enableSpatialAudio = useEnablePositionalAudio({ initialized });

  usePeerPositionalAudio({
    authenticated$,
    consumers$,
    broadcasters$: broadcastingPeers$,
    distancesByPeer$,
    enableSpatialAudio,
    peerPositions$,
    listener$,
    spaceId$,
  });

  const aggregateConsumers$ = useConsumers({
    consumerTransport$,
    consumers$,
    sessionPaths$,
    enteredSpace$,
  });

  useObserveAndSendDeviceOrientation({
    sessionId$,
    userId$,
  });

  const joystickMoveRef = useRef<IJoystickUpdateEvent>();

  const handleJoystickMove = useCallback((event: IJoystickUpdateEvent) => {
    joystickMoveRef.current = event;
  }, []);

  const [
    fullScreenElement,
    setFullScreenElement,
  ] = useState<HTMLElement | null>(null);

  const canvasAndModalContext = useCanvasAndModalContext();

  const theme$ = useTheme({
    spaceId,
    documentationMode: documentation,
  });

  const avatarMeshes = useAvatarMeshes(theme$);

  const selfAvatar = useSelfAvatar({
    audioContext,
    audioStream: userMedia.mic.sendingStream,
    selfMetadata$: profileSetter.metaDataWithUpdates$,
    videoPaused: userMedia.webcam.paused,
    videoTrack: userMedia.webcam.sendingStream,
  });

  const peersMetadata = usePeerMetadata({ spaceId });

  const router = useRouter();

  const spaceContext: SpaceContextType = {
    ...canvasAndModalContext,
    serverTimeOffset$,
    initialized$,
    spaceSettings,
    router,
    spaceSlugFromPath,
    spaceSlug,
    activeSessions$,
    consumers$: aggregateConsumers$,
    interactable: enteredSpace,
    listener$,
    sessionPaths$,
    spatialAudioEnabled: enableSpatialAudio,
    transports$,
    spaceId,
    selfAvatar,
    theme$,
    avatarMeshes,
    screenSharing: screenShare,
    canEdit,
    peersMetadata,
    audioContext,
  };

  const {
    fullyLoaded,
    elementsLoadedProgress,
    setElementLoadedProgress,
  } = useElementsLoadedProgress();

  const sceneContainer = spaceId && (
    <SceneContainer
      spaceId={spaceId}
      updatePlayerLocation={updatePlayerLocation}
      playerLocation$={playerLocation$}
      // communicators={communicators}
      sessionId={sessionId}
      visiblePeersSortedByDistance$={allVisiblePeers$}
      peersSettings$={peersSettings$}
      peerLocations$={peerPositions$}
      spaceId$={spaceId$}
      sessionId$={sessionId$}
      render={render}
      initialX={initialX}
      initialY={initialY}
      initialZ={initialZ}
      initialLookAtX={initialLookAtX}
      initialLookAtY={initialLookAtY}
      initialLookAtZ={initialLookAtZ}
      controlsSettings={controlsSettings}
      userId={userId}
      enteredSpace={enteredSpace}
      joystickMoveRef={joystickMoveRef}
      documentation={documentation}
      loadingComplete={fullyLoaded}
      setLoadedProgress={setElementLoadedProgress}
      peerConsumers={{
        peersToHear$,
        peersToSee$,
        producingPeers,
      }}
    />
  );
  return (
    <>
      {!fullyLoaded && enteredSpace && (
        <AnimatedAriumLogo
          showProgress
          progress={elementsLoadedProgress}
          hint="loading scene"
        />
      )}
      <div ref={setFullScreenElement} className={styles.spaceWrapper}>
        <SpaceContext.Provider value={spaceContext}>
          {!sceneContainer && <LoadingSpinContainer />}
          {!disableChat && enteredSpace && authenticated && !documentation && (
            //  if we unmount and re-mount this component, the user will get a new ID
            <div className={clsx(hideUI && styles.opacityZero)}>
              <Chat
                userName$={userName$}
                spaceId$={spaceId$}
                userId$={userId$}
                sessionId$={sessionId$}
                serverTimeOffset$={serverTimeOffset$}
              />
            </div>
          )}
          {!enteredSpace && (
            <EntranceFlow
              spaceId={spaceId}
              userMedia={userMedia}
              initialize={initialize}
              initialized={initialized}
              enterSpace={enterSpace}
              setKeyboardControlsDisabled={setKeyboardControlsDisabled}
              spaceMetadata={spaceMetadata}
              profileSetter={profileSetter}
              eventSlug={eventSlug}
              spaceSlug={spaceSlug}
              inviteId={inviteId}
              isAnonymous={authState.isAnonymous}
              userId={authState.userId}
            />
          )}
          {UserInterface && enteredSpace && !documentation && fullyLoaded && (
            // Workaround. if we unmount this component, the selfview video will disappear.
            <div className={clsx(hideUI && styles.opacityZero)}>
              <UserInterface
                userMedia={userMedia}
                audioContext={audioContext}
                setKeyboardControlsDisabled={setKeyboardControlsDisabled}
                joystickMove={handleJoystickMove}
                joinStatus={joinStatus}
                fullScreenElement={fullScreenElement}
                spaceId={spaceId}
                user={user || undefined}
                profileSetter={profileSetter}
                broadcasting={broadcastingControls}
                disableUserMediaControls={disableUserMediaControls}
                canInviteToEdit={canInviteToEdit}
                spaceSlug={spaceSlug}
                playerLocation$={playerLocation$}
              />
            </div>
          )}
          {fullScreen && (
            <div className={styles.space}>
              <div
                className={(styles.sceneContainer, styles.fullScreenContainer)}
              >
                {sceneContainer}
              </div>
            </div>
          )}
          {!fullScreen && sceneContainer}
          {externalVideo && initialized && (
            <video
              crossOrigin="anonymous"
              src={externalVideo}
              ref={externalVideoRef}
              controls
              loop
              playsInline
              autoPlay
            />
          )}
        </SpaceContext.Provider>
      </div>
    </>
  );
};

export default Space;
