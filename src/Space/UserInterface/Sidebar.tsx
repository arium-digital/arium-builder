import React, { useCallback } from "react";
import { UserMedia } from "../componentTypes";
import InputSelect from "./InputSelect";

import clsx from "clsx";

import { Col, Row, Container } from "react-bootstrap";

import styles from "../../css/controls.module.scss";
import onboardingStyles from "./styles/entranceFlow.module.scss";
import { preventHighlight } from "Space/utils/controls";
import cta from "css/cta.module.scss";

import { ProfileSetter } from "./Profile/hooks";
import { User } from "db";
// import ProfileImageCapture from "./Profile/ProfileImageCapture";
// import NameEditor from "./NameEditor";
import CloseIcon from "./CloseIcon";

const Sidebar = ({
  userMedia,
  profileSetter,
  setKeyboardControlsDisabled,
  setSidebarOpen,
  sidebarOpen,
  openBetaSignupModule,
  user,
  hidden,
}: {
  userMedia: UserMedia;
  setKeyboardControlsDisabled: (disabled: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  openBetaSignupModule: (e: React.SyntheticEvent) => void;
  sidebarOpen: boolean;
  user: User;
  profileSetter: ProfileSetter;
  hidden: boolean;
}) => {
  const toggleDrawer = useCallback(
    (e: React.SyntheticEvent) => {
      preventHighlight(e);
      setSidebarOpen(!sidebarOpen);
    },
    [sidebarOpen, setSidebarOpen]
  );

  // const {
  //   // metaDataWithUpdates$,
  //   // name$,
  //   // setAndAutoSaveName,
  //   // setAndAutoSaveProfileImage,
  // } = profileSetter;

  // const nameFieldRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={clsx({
        [styles.hidden]: hidden,
      })}
    >
      <Container
        fluid
        className={clsx(styles.sidebarContainer, "vh-100 p-0 m-0")}
      >
        <div
          className={`${styles.sidebarColumn} ${
            sidebarOpen ? "" : styles.sidebarColumnHidden
          }`}
        >
          <Container fluid className="h-100 px-0 px-md-1">
            {sidebarOpen && (
              <Col className="clickable px-0 px-md-2 h-100">
                <button
                  className={clsx(styles.clickable, styles.sidebarExitButton)}
                  onClick={toggleDrawer}
                >
                  <CloseIcon />
                </button>
                <Row className={clsx(styles.clickable, "mr-auto pl-4 py-4")}>
                  <a href="https://arium.xyz">
                    <img
                      src="/images/icons/hosted-by-arium.svg"
                      alt="the letter a"
                      className={styles.sidebarLogo}
                    />
                  </a>
                </Row>
                <Row>
                  <Col xs={12}>
                    {/* <ProfileImageCapture
                      handleProfilePhotoUrlUpdated={setAndAutoSaveProfileImage}
                      peerMetadata$={metaDataWithUpdates$}
                      userId={user.uid}
                    /> */}
                  </Col>
                </Row>
                <Row
                  className={clsx(
                    onboardingStyles.selectContainer,
                    styles.clickable,
                    "my-3 py-1 mx-2 p-0"
                  )}
                >
                  <Col
                    xs={2}
                    md={1}
                    className="px-0 px-md-2 py-1 py-md-2 m-0 align-self-center"
                  >
                    <img
                      src="/images/icons/nametag-icon.svg"
                      alt="nametag icon"
                    />
                  </Col>
                  <Col
                    xs={10}
                    md={11}
                    className={"align-self-end px-0 px-md-4 py-1 py-md-4"}
                  >
                    {/* <NameEditor
                      name$={name$}
                      setKeyboardControlsDisabled={setKeyboardControlsDisabled}
                      setName={setAndAutoSaveName}
                      nameFieldRef={nameFieldRef}
                    /> */}
                  </Col>
                </Row>

                <Row
                  className={clsx(
                    onboardingStyles.selectContainer,
                    styles.clickable,
                    "my-3 py-1 mx-2"
                  )}
                >
                  <Col
                    xs={2}
                    md={1}
                    className="px-0 px-md-2 py-1 py-md-2 m-0 align-self-center"
                  >
                    <img
                      src="/images/icons/camera-icon.svg"
                      alt="camera icon"
                    />
                  </Col>
                  <Col
                    xs={10}
                    md={11}
                    className={"align-self-end px-0 px-md-4 py-1 py-md-4"}
                  >
                    {userMedia.webcam.deviceList && (
                      <InputSelect
                        title="Choose Webcam"
                        devices={userMedia.webcam.deviceList}
                        refreshAvailableDevices={
                          userMedia.refreshAvailableDevices
                        }
                        inputSelect={userMedia.webcam.selectSendingDevice}
                        currentDeviceId={userMedia.webcam.sendingDeviceId}
                        disabled={
                          !userMedia.webcam.sendingStream ||
                          userMedia.webcam.gettingStream
                        }
                      />
                    )}
                  </Col>
                </Row>
                <Row
                  className={clsx(
                    onboardingStyles.selectContainer,
                    styles.clickable,
                    "my-3 py-1 mx-2"
                  )}
                >
                  <Col
                    xs={2}
                    md={1}
                    className="px-0 px-md-2 py-1 py-md-2 m-0 align-self-center"
                  >
                    <img
                      src="/images/icons/microphone-icon.svg"
                      alt="microphone icon"
                    />
                  </Col>
                  <Col
                    xs={10}
                    md={11}
                    className={"align-self-end px-0 px-md-4 py-1 py-md-4"}
                  >
                    {userMedia.mic.deviceList && (
                      <InputSelect
                        title="Choose Microphone"
                        devices={userMedia.mic.deviceList}
                        refreshAvailableDevices={
                          userMedia.refreshAvailableDevices
                        }
                        disabled={
                          !userMedia.mic.sendingStream ||
                          userMedia.mic.gettingStream
                        }
                        inputSelect={userMedia.mic.selectSendingDevice}
                        currentDeviceId={userMedia.mic.sendingDeviceId}
                      />
                    )}
                  </Col>
                </Row>

                <Row
                  className={clsx(
                    styles.betaSignUp,
                    styles.fullWidth,
                    "py-4 justify-content-center"
                  )}
                >
                  <Col sm={12} className={"mx-5"}>
                    <Row className="justify-content-center">
                      <div className="d-none d-lg-block">
                        <p>Want to host your next event on Arium?</p>&nbsp;
                        <div className={cta.container}>
                          <button
                            onClick={openBetaSignupModule}
                            className={cta.primary}
                          >
                            Sign up for our Beta
                          </button>
                        </div>
                      </div>

                      <div className="d-block d-lg-none w-100">
                        <div
                          className={clsx(cta.container)}
                          style={{ position: "relative", top: "37px" }}
                        >
                          <button
                            onClick={toggleDrawer}
                            className={cta.primary}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </Row>
                  </Col>
                </Row>
              </Col>
            )}
          </Container>
        </div>
      </Container>

      {!sidebarOpen && (
        <div className="d-none d-lg-block">
          <div className={styles.sidebarButtonContainer}>
            <button
              className={clsx(
                styles.clickable,
                styles.drawerOpenButton,
                styles.withPadding
              )}
              onClick={toggleDrawer}
            >
              <img src="/images/icons/sidebar-button.svg" alt="small arrow" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
