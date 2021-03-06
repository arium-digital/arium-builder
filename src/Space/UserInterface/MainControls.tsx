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
import { EditorContext } from "Space/InSpaceEditor/hooks/useEditorState";
import StandaloneModuleWrapper from "./EntranceFlow/StandaloneModuleWrapper";
import SetProfile from "./Profile/SetProfile";
import ShareDialog from "./Dialogs/ShareDialog";
import ScreenCaptureDialog from "./Dialogs/ScreenCaptureDialog";
import { useCaptureFromCanavs } from "libs/sceneCapture";
import ThreeContext from "Space/ThreeContext";

const InSpaceEditor = dynamic(() => import("Space/InSpaceEditor"));

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
    user,
    profileSetter,
    fullScreenElement,
    spaceSlug,
    canInviteToEdit,
    playerLocation$,
    spaceId,
  } = props;

  const [showModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      setKeyboardControlsDisabled(true);
    } else setKeyboardControlsDisabled(false);
  }, [showModal, setKeyboardControlsDisabled]);

  const editorState = useContext(EditorContext);

  const editorSidebarOpen = !!editorState?.contentsTreeOpen;

  const { open: settingsOpen } = useOpenDialog();

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
          peerMetadata$={props.profileSetter.metaDataWithUpdates$}
          hide={editorSidebarOpen || settingsOpen || profileOpen}
          sidebarOpen={false}
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
