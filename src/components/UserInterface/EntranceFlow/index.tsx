import React, { useState, useCallback, useEffect } from "react";

import Onboarding from "./Onboarding";

import styles from "css/ui.module.scss";
import { EntranceFlowProps } from "components/componentTypes";
import FailedStreamDialog from "./FailedStreamDialog";
import LegalLinks from "components/LegalLinks";

const EntranceFlow = ({
  initialize,
  initialized,
  spaceId,
  enterSpace,
  userMedia: mediaDevices,
  profileSetter,
  setKeyboardControlsDisabled,
  spaceMetadata,
  eventSlug,
  spaceSlug,
  inviteId,
  isAnonymous,
  userId,
}: EntranceFlowProps) => {
  const [
    failedStreamDialogDismissed,
    setFailedStreamDialogDismissed,
  ] = useState<boolean>(false);

  const dismissWarning = useCallback(() => {
    setFailedStreamDialogDismissed(true);
  }, [setFailedStreamDialogDismissed]);

  const failedGettingWebcamStream = mediaDevices.webcam.failedGettingStream;
  const failedGettingMicStream = mediaDevices.mic.failedGettingStream;

  const { refreshAvailableDevices } = mediaDevices;

  useEffect(() => {
    refreshAvailableDevices();
  }, [
    refreshAvailableDevices,
    mediaDevices.mic.sendingDeviceId,
    mediaDevices.webcam.sendingDeviceId,
  ]);

  return (
    <>
      <div className={styles.userInterface}>
        <div className={styles.onboarding}>
          {(failedGettingMicStream || failedGettingWebcamStream) &&
            !failedStreamDialogDismissed && (
              <FailedStreamDialog dismissWarning={dismissWarning} />
            )}
          <Onboarding
            spaceId={spaceId}
            inviteId={inviteId}
            enterSpace={enterSpace}
            mediaDevices={mediaDevices}
            setKeyboardControlsDisabled={setKeyboardControlsDisabled}
            profileSetter={profileSetter}
            initialize={initialize}
            initialized={initialized}
            spaceMetadata={spaceMetadata}
            eventSlug={eventSlug}
            spaceSlug={spaceSlug}
            isAnonymous={isAnonymous}
            userId={userId}
          />
        </div>
      </div>
      <div className={styles.legalLinksContainer}>
        <LegalLinks />
      </div>
    </>
  );
};

export default EntranceFlow;
