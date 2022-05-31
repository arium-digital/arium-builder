import React, {
  memo,
  useState,
  useCallback,
  useEffect,
  useContext,
} from "react";
import { UserInterfaceProps } from "../componentTypes";

import clsx from "clsx";

import styles from "../../css/controls.module.scss";

import FooterControls from "./FooterControls";
import dynamic from "next/dynamic";
import { EditorContext } from "components/InSpaceEditor/hooks/useEditorState";
import SelectDevices from "./SelectDevices";
import StandaloneModuleWrapper from "./EntranceFlow/StandaloneModuleWrapper";
import SetProfile from "./Profile/SetProfile";
import ShareDialog from "./Dialogs/ShareDialog";
import ScreenCaptureDialog from "./Dialogs/ScreenCaptureDialog";
import { useCaptureFromCanavs } from "libs/sceneCapture";
import ThreeContext from "components/ThreeContext";

const InSpaceEditor = dynamic(() => import("components/InSpaceEditor"));

const useOpenDialog = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    open,
    handleClose,
    handleOpen,
  };
};

const MainControls = memo((props: UserInterfaceProps) => {
  const {
    joystickMove,
    setKeyboardControlsDisabled,
    userMedia,
    user,
    broadcasting,
    disableUserMediaControls,
    profileSetter,
    fullScreenElement,
    spaceSlug,
    canInviteToEdit,
    playerLocation$,
    spaceId,
  } = props;

  const { refreshAvailableDevices } = userMedia;

  const [showModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      setKeyboardControlsDisabled(true);
    } else setKeyboardControlsDisabled(false);
  }, [showModal, setKeyboardControlsDisabled]);

  const editorState = useContext(EditorContext);

  const editorSidebarOpen = !!editorState?.contentsTreeOpen;

  const {
    open: settingsOpen,
    handleOpen: handleOpenSettings,
    handleClose: handleCloseSettings,
  } = useOpenDialog();

  const {
    open: profileOpen,
    handleOpen: openProfileModule,
    handleClose: closeProfileModule,
  } = useOpenDialog();
  const {
    open: shareDialogOpen,
    handleOpen: openShareDialog,
    handleClose: closeShareDialog,
  } = useOpenDialog();

  const {
    open: captureDialogOpen,
    handleOpen: openCaptureDialog,
    handleClose: closeCaptureDialog,
  } = useOpenDialog();

  const [screenshotDataUri, setScreenshotDataUri] = useState<string>();

  const three = useContext(ThreeContext)?.three;
  const { captureScreenshot } = useCaptureFromCanavs({ three });

  const captureScreenshotAndOpen = useCallback(async () => {
    if (!captureScreenshot) return;
    setScreenshotDataUri(undefined);
    const screenshotContents = captureScreenshot();

    setScreenshotDataUri(screenshotContents);

    openCaptureDialog();

    return screenshotContents;
  }, [captureScreenshot, openCaptureDialog]);

  return (
    <>
      {settingsOpen && (
        <StandaloneModuleWrapper>
          <SelectDevices
            mediaDevices={userMedia}
            handleContinue={handleCloseSettings}
            buttonText="Close"
          />
        </StandaloneModuleWrapper>
      )}
      {profileOpen && user && (
        <StandaloneModuleWrapper>
          <SetProfile
            handleContinue={closeProfileModule}
            hasWebcamStream={false}
            setKeyboardControlsDisabled={setKeyboardControlsDisabled}
            user={user}
            profileSetter={profileSetter}
            buttonText="Close"
          />
        </StandaloneModuleWrapper>
      )}
      <div className={clsx(styles.root)}>
        {editorState && <InSpaceEditor editorState={editorState} />}

        <FooterControls
          joystickMove={joystickMove}
          openProfileModule={openProfileModule}
          userMedia={userMedia}
          peerMetadata$={props.profileSetter.metaDataWithUpdates$}
          hide={editorSidebarOpen || settingsOpen || profileOpen}
          sidebarOpen={false}
          refreshAvailableDevices={refreshAvailableDevices}
          broadcasting={broadcasting}
          disableUserMediaControls={disableUserMediaControls}
          handleOpenSettings={handleOpenSettings}
          fullScreenElement={fullScreenElement}
          openShareDialog={openShareDialog}
          captureScreenshot={captureScreenshotAndOpen}
        />
      </div>
      <ShareDialog
        editorState={editorState}
        open={shareDialogOpen}
        handleClose={closeShareDialog}
        canInviteToEdit={canInviteToEdit}
        spaceSlug={spaceSlug}
        playerLocation$={playerLocation$}
        spaceId={spaceId}
        userId={user?.uid}
      />
      <ScreenCaptureDialog
        open={captureDialogOpen}
        handleClose={closeCaptureDialog}
        screenshotDataUri={screenshotDataUri}
        spaceSlug={spaceSlug}
      />
    </>
  );
});

export default MainControls;
