import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import SceneContainer from "./SceneContainer";

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
import { BehaviorSubject } from "rxjs";
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
import { useJoinSpace } from "../hooks/useJoinSpace";
import { useAudioAndListener } from "../hooks/useListener";
import useEnablePositionalAudio from "../hooks/useEnableSpatialAudio";

import styles from "../css/space.module.scss";
import { useObserveAndSendDeviceOrientation } from "../hooks/useDeviceOrientation";
import { LoadingSpinContainer } from "./UserInterface/LoadingSpinAnimation";
import { SpaceAccessContext } from "hooks/auth/useSpaceAccess";
import Chat from "./Chat";
import useServerTimeOffset from "hooks/useServerTimeOffset";
import EntranceFlow from "./UserInterface/EntranceFlow";
import { useCanvasAndModalContext } from "hooks/useCanvasAndModalContext";
import useControlsSettings from "hooks/useControlsSettings";
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

  const spaceId$ = useBehaviorSubjectFromCurrentValue(spaceId);

  const spaceAccessContext = useContext(SpaceAccessContext);

  const canInviteToEdit =
    !!spaceAccessContext?.editor || !!spaceAccessContext?.isAdmin;

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

  const userId$ = useBehaviorSubjectFromCurrentValue(userId);

  const { sessionId$, joinStatus$ } = useJoinSpace({
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

  const { setMetadata } = useMetadata({
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

  const enteredSpace$ = useBehaviorSubjectFromCurrentValue(enteredSpace);

  const initialize = useCallback(() => {
    setInitialized(true);
  }, []);

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

  const { allVisiblePeers$ } = usePeerDistanceCalculations({
    playerLocation$,
    activeSessions$,
    peerPositions$,
    broadcastingPeers$,
    peersSettings$,
  });

  const enableSpatialAudio = useEnablePositionalAudio({ initialized });

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
    selfMetadata$: profileSetter.metaDataWithUpdates$,
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
    interactable: enteredSpace,
    listener$,
    sessionPaths$,
    spatialAudioEnabled: enableSpatialAudio,
    spaceId,
    selfAvatar,
    theme$,
    avatarMeshes,
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
        </SpaceContext.Provider>
      </div>
    </>
  );
};

export default Space;
