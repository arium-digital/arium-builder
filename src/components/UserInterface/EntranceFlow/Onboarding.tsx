import { Col, Row, Container } from "react-bootstrap";
import React, { useCallback, useEffect, useState, useMemo } from "react";

import styles from "../styles/entranceFlow.module.scss";
import clsx from "clsx";
import WelcomMessage from "./WelcomeMessage";
import { SpaceMeta } from "../../../../shared/spaceMeta";
import { UserMedia } from "components/componentTypes";
import SelectDevices from "../SelectDevices";
import SetProfile from "../Profile/SetProfile";
import { useAuthentication } from "hooks/auth/useAuthentication";
import { ProfileSetter } from "../Profile/hooks";
import GrantAccessDialog from "./GrantAccessDialog";
import { Optional } from "types";
import SpaceInvite from "../Dialogs/SpaceInvite";

function generateSpaceName({
  spaceName,
  spaceSlug,
}: {
  spaceName: Optional<string>;
  spaceSlug: string;
}) {
  return spaceName || spaceSlug;
}

function welcomeMessageFromMetadata(spaceName: Optional<string>) {
  return `Welcome to ${spaceName} in Arium`;
}

const Onboarding = ({
  spaceId,
  spaceSlug,
  enterSpace,
  mediaDevices,
  setKeyboardControlsDisabled,
  initialized,
  spaceMetadata,
  initialize,
  profileSetter,
  eventSlug,
  inviteId,
  isAnonymous,
  userId,
}: {
  spaceId: string;
  enterSpace: () => void;
  mediaDevices: UserMedia;
  setKeyboardControlsDisabled: (disabled: boolean) => void;
  initialized: boolean;
  initialize: (skipAccess: boolean) => void;
  spaceMetadata: SpaceMeta | undefined;
  profileSetter: ProfileSetter;
  eventSlug: Optional<string>;
  spaceSlug: string;
  inviteId: string | undefined;
  isAnonymous: boolean;
  userId: Optional<string>;
}) => {
  const [deviceSelectionComplete, setDeviceSelectionComplete] = useState(false);
  const [profileSet, setProfileSet] = useState(false);

  const handleDeviceSelectionContinue = useCallback(() => {
    setDeviceSelectionComplete(true);
  }, [setDeviceSelectionComplete]);

  const failedGettingWebcamStream = mediaDevices.webcam.failedGettingStream;
  const failedGettingMicStream = mediaDevices.mic.failedGettingStream;

  useEffect(() => {
    if (failedGettingWebcamStream && failedGettingMicStream) {
      setDeviceSelectionComplete(true);
    }
  }, [failedGettingWebcamStream, failedGettingMicStream]);

  const handleProfileContinue = useCallback(() => {
    setProfileSet(true);
  }, [setProfileSet]);

  useEffect(() => {
    if (profileSet && deviceSelectionComplete) enterSpace();
  }, [profileSet, deviceSelectionComplete, enterSpace]);

  const spaceName = generateSpaceName({
    spaceName: spaceMetadata?.name,
    spaceSlug,
  });

  const [inviteDialogComplete, setInviteDialogComplete] = useState(false);

  const { user } = useAuthentication({ ensureSignedInAnonymously: false });

  const handleWebcamDialogClose = useCallback(
    (skipAccess: boolean) => {
      initialize(skipAccess);
      if (skipAccess) handleDeviceSelectionContinue();
      setInviteDialogComplete(true);
    },
    [initialize, handleDeviceSelectionContinue]
  );

  const handleInviteComplete = useCallback(() => {
    setInviteDialogComplete(true);
  }, []);

  const showWelcomeMessage = !initialized && !eventSlug && !inviteId;

  const welcomeMessageText = useMemo(() => {
    return showWelcomeMessage
      ? "Please allow Arium to access your camera and microphone"
      : welcomeMessageFromMetadata(spaceName);
  }, [showWelcomeMessage, spaceName]);

  if (inviteId && !inviteDialogComplete)
    return (
      <SpaceInvite
        inviteId={inviteId}
        spaceId={spaceId}
        spaceSlug={spaceSlug}
        onComplete={handleInviteComplete}
        spaceName={spaceName}
        isAnonymous={isAnonymous}
        userId={userId}
      />
    );

  const contents = (
    <>
      {!initialized && (
        <GrantAccessDialog
          close={handleWebcamDialogClose}
          headingText={welcomeMessageText}
          spaceSlug={spaceSlug}
          spaceId={spaceId}
        />
      )}
      {initialized && !deviceSelectionComplete && (
        <SelectDevices
          mediaDevices={mediaDevices}
          handleContinue={handleDeviceSelectionContinue}
        />
      )}
      {deviceSelectionComplete && user && (
        <SetProfile
          hasWebcamStream={!!mediaDevices.webcam.sendingStream}
          handleContinue={handleProfileContinue}
          profileSetter={profileSetter}
          setKeyboardControlsDisabled={setKeyboardControlsDisabled}
          user={user}
        />
      )}
    </>
  );

  return (
    <Container fluid className={clsx(styles.container, "vh-100 mx-0 px-0")}>
      <Col className="vh-100 mx-0 px-0">
        {showWelcomeMessage && (
          <Row className={"justify-content-center vh-100 mx-0 px-0"}>
            <Col
              xs={12}
              md={6}
              className={clsx(
                styles.eventDescriptionContainer,
                "align-self-start align-self-md-center justify-self-start mr-auto"
              )}
            >
              <WelcomMessage
                spaceSlug={spaceSlug}
                spaceMetadata={spaceMetadata}
              />
            </Col>
            <Col
              xs={12}
              md={4}
              className="align-self-md-center align-self-start mr-auto"
              style={{ position: "relative" }}
            >
              {contents}
            </Col>
          </Row>
        )}
        {!showWelcomeMessage && (
          <Row className={"justify-content-center vh-100 mx-0 px-0"}>
            <Col
              xs={12}
              md={8}
              lg={6}
              xl={4}
              className="align-self-md-center"
              style={{ position: "relative" }}
            >
              {contents}
            </Col>
          </Row>
        )}
      </Col>
    </Container>
  );
};

export default Onboarding;
