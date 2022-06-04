import { Col, Row } from "react-bootstrap";
import React, { useRef, useEffect } from "react";

import styles from "../styles/entranceFlow.module.scss";
import cta from "css/cta.module.scss";
import clsx from "clsx";
import NameEditor from "../NameEditor";
import ProfileImageCapture from "./ProfileImageCapture";
import { User } from "db";
import { ProfileSetter } from "./hooks";

const SetProfile = ({
  handleContinue,
  hasWebcamStream,
  setKeyboardControlsDisabled,
  user,
  profileSetter,
  buttonText = "Let's Go!",
}: {
  handleContinue?: () => void;
  hasWebcamStream?: boolean;
  setKeyboardControlsDisabled: (disabled: boolean) => void;
  user: User;
  profileSetter: ProfileSetter;
  buttonText?: string;
}) => {
  const nameFieldRef = useRef<HTMLInputElement>(null);
  const continueDisabled = profileSetter.updatingProfile;

  useEffect(() => {
    const sub = profileSetter.savedPhotoUrl$.subscribe({
      next: () => nameFieldRef.current?.focus(),
    });

    return () => {
      sub.unsubscribe();
    };
  }, [profileSetter.savedPhotoUrl$]);

  useEffect(() => {
    if (!handleContinue) return;
    const sub = profileSetter.saved$.subscribe({
      next: () => handleContinue(),
    });

    return () => sub.unsubscribe();
  }, [profileSetter.saved$, handleContinue]);

  return (
    <>
      <ProfileImageCapture
        hasVideoStream={hasWebcamStream}
        // setChangingVideo={setChangingVideo}
        handleProfilePhotoUrlUpdated={profileSetter.setNewProfileImage}
        peerMetadata$={profileSetter.metaDataWithUpdates$}
        userId={user.uid}
      />
      <Row
        className={clsx(
          styles.selectContainer,
          styles.borderTop,
          "mt-5 mt-md-1 py-2 mx-2 px-0"
        )}
      >
        <Col xs={2} md={1} className="py-2 m-0 align-self-center">
          <img src="/images/icons/nametag-icon.svg" alt="nametag icon" />
        </Col>
        <Col
          xs={10}
          md={11}
          className="align-self-end px-4 py-2 justify-content-center"
        >
          <NameEditor
            name$={profileSetter.name$}
            setKeyboardControlsDisabled={setKeyboardControlsDisabled}
            setName={profileSetter.setName}
            nameFieldRef={nameFieldRef}
          />
        </Col>
      </Row>
      <Row className={"my-5 justify-content-center"}>
        <Col xs={12} className="align-self-end px-4 justify-content-center">
          <div
            className={clsx(
              cta.container,
              cta.bottomFixedOnSmall,
              continueDisabled ? cta.disabled : ""
            )}
          >
            <button
              onClick={profileSetter.handleContinueClicked}
              className={cta.primary}
              id="enter"
              disabled={continueDisabled}
            >
              {buttonText}
            </button>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default SetProfile;
