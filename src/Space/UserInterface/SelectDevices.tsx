import InputSelect from "./InputSelect";
import { Col, Row } from "react-bootstrap";
import React, { useCallback, MouseEvent } from "react";

import styles from "./styles/entranceFlow.module.scss";
import clsx from "clsx";
import { UserMedia, UserMediaForDevice } from "Space/componentTypes";
import SelfViewRow from "./EntranceFlow/SelfViewCircle";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import CtaButton from "./CtaButton";

const DeviceSelect = ({
  mediaDevice,
  enabledIcon,
  disabledIcon,
  dropdownTitle,
  refreshAvailableDevices,
}: {
  mediaDevice: UserMediaForDevice;
  enabledIcon: JSX.Element;
  disabledIcon: JSX.Element;
  dropdownTitle: string;
  refreshAvailableDevices: () => void;
}) => {
  const {
    gettingStream,
    paused,
    pause,
    resume,
    failedGettingStream,
  } = mediaDevice;

  const toggleSending = useCallback(() => {
    if (paused) {
      resume();
      try {
        refreshAvailableDevices();
      } catch (e) {
        console.error(e);
      }
    } else pause();
  }, [pause, paused, refreshAvailableDevices, resume]);

  const toggleDevice = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      toggleSending();
    },
    [toggleSending]
  );

  const enabled = !failedGettingStream;

  const icon = paused ? disabledIcon : enabledIcon;

  return (
    <>
      <Col xs={2} md={1} className="p-2 m-0 align-self-center">
        <>
          {!enabled && <>{icon}</>}
          {enabled && (
            <a href="#" onClick={toggleDevice}>
              {icon}
            </a>
          )}
        </>
      </Col>
      <Col xs={10} md={11} className="px-2 py-2 justify-content-center">
        {mediaDevice.deviceList && !failedGettingStream && (
          <InputSelect
            title={dropdownTitle}
            devices={mediaDevice.deviceList}
            refreshAvailableDevices={refreshAvailableDevices}
            inputSelect={mediaDevice.selectSendingDevice}
            currentDeviceId={mediaDevice.sendingDeviceId}
            disabled={!mediaDevice.sendingStream || gettingStream}
          />
        )}
      </Col>
    </>
  );
};

const SelectDevices = ({
  // audioContext,
  mediaDevices,
  handleContinue,
  buttonText = "Continue",
}: {
  // audioContext: AudioContext | undefined;
  mediaDevices: UserMedia;
  handleContinue: () => void;
  buttonText?: string;
}) => {
  const handleContinueClicked = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      handleContinue();
    },
    [handleContinue]
  );

  const { refreshAvailableDevices } = mediaDevices;

  return (
    <>
      <SelfViewRow />
      <Row
        className={clsx(
          styles.selectContainer,
          "my-1 py-2 px-0 mx-2 d-none d-md-flex"
        )}
      >
        <DeviceSelect
          mediaDevice={mediaDevices.webcam}
          enabledIcon={<VideocamIcon />}
          disabledIcon={<VideocamOffIcon />}
          dropdownTitle="Choose Webcam"
          refreshAvailableDevices={refreshAvailableDevices}
        />
      </Row>
      <Row
        className={clsx(
          styles.selectContainer,
          "my-1 py-2 px-0 mx-2 d-none d-md-flex"
        )}
      >
        <DeviceSelect
          mediaDevice={mediaDevices.mic}
          enabledIcon={<MicIcon />}
          disabledIcon={<MicOffIcon />}
          dropdownTitle="Choose Microphone"
          refreshAvailableDevices={refreshAvailableDevices}
        />
      </Row>
      <Row className={"my-5 py-3 justify-content-center"}>
        <CtaButton
          buttonText={buttonText}
          handleClick={handleContinueClicked}
          bottomFixedOnSmall
        />
      </Row>
    </>
  );
};

export default SelectDevices;
