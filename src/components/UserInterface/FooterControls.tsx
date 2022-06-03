import {
  useState,
  useEffect,
  useMemo,
  memo,
  useCallback,
  ReactChild,
} from "react";
import {
  BroadcastingControlsState,
  HandleJoystickMove,
  UserMedia,
  UserMediaForDevice,
} from "../componentTypes";
import { Container } from "react-bootstrap";
import { ToggleButton, DevicePauseAvatarProps } from "./DeviceSelects";
import Tooltip from "@material-ui/core/Tooltip";

import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VoiceOverOffIcon from "@material-ui/icons/VoiceOverOff";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import SettingsIcon from "@material-ui/icons/Settings";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import PhotoCamera from "@material-ui/icons/PhotoCamera";

// import SimpleVideoSelfVie from "./Controls";
import clsx from "clsx";
import { Observable } from "rxjs";

import { Col, Row } from "react-bootstrap";

import styles from "../../css/controls.module.scss";
import JoystickController from "./JoystickController";
// import AudioLevelIndicator from "./AudioLevelIndicator";
import { PossiblyNullStringDict } from "types";
// import { METADATA_KEYS } from "hooks/usePeersMetadata";
import SelfView from "components/Consumers/SelfView";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { useFullScreen } from "components/Controls/FullScreenToggle";
import SendIcon from "@material-ui/icons/Send";

export const Instructions = ({
  displayTimeout = 30000,
}: {
  displayTimeout?: number;
}) => {
  const [display, setDisplay] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplay(false);
    }, displayTimeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [displayTimeout]);

  if (!display) return null;

  return (
    <>
      <Col className="align-items-center" style={{ height: "100%" }}>
        <Row
          className={clsx(styles.instructions, "align-items-center mx-auto")}
        >
          <Col xs={4}>
            <img
              src="/images/icons/small-keys-icon.svg"
              alt="computer arrow keys"
            />
          </Col>
          <Col xs={8} className={clsx(styles.instructionsText)}>
            <strong>Move</strong>
            <br /> WASD keys
          </Col>
        </Row>
      </Col>
      <Col className="align-items-center" style={{ height: "100%" }}>
        <Row
          className={clsx(styles.instructions, "align-items-center mx-auto")}
        >
          <Col xs={4}>
            <img
              src="/images/icons/click-and-drag-icon.svg"
              alt="computer mouse icon"
            />
          </Col>
          <Col xs={8} className={clsx(styles.instructionsText)}>
            <strong>Look</strong>
            <br /> Click & Drag
          </Col>
        </Row>
      </Col>
    </>
  );
};

const BroadcastingControls = ({
  broadcasting,
  canManuallyBroadcast,
  toggleBroadcasting,
}: BroadcastingControlsState) => {
  return (
    <ToggleButton
      key="broadcasting"
      off={!broadcasting}
      resumeText="Not Broadcasting, Click to Broadcast"
      pauseText="Broadcasting"
      toggle={toggleBroadcasting}
      offIcon={<VoiceOverOffIcon className={styles.icon} />}
      onIcon={<RecordVoiceOverIcon className={clsx(styles.icon)} />}
      alertColorWhenOn
      onStatus={
        <Tooltip title="When you are broadcasting, everyone in the space can hear you, regardless of how far they are from you.">
          <></>
          {/* <Chip
            size="small"
            label="broadcasting"
            style={{
              position: "absolute",
              backgroundColor: ariumRed,
              color: ariumCream,
              left: 0,
              bottom: -10,
            }}
          /> */}
        </Tooltip>
      }
    />
  );
};

export const MediaDevicePauseAvatar = memo(
  ({
    userMedia,
    ...rest
  }: Omit<DevicePauseAvatarProps, "toggle" | "off"> & {
    userMedia: UserMediaForDevice;
  }) => {
    const { paused, pause, resume } = userMedia;

    const toggle = useCallback(() => {
      if (paused) resume();
      else pause();
    }, [paused, pause, resume]);

    return <ToggleButton {...rest} off={paused} toggle={toggle} />;
  }
);

const SettingsAvatar = ({
  mediaDevices,
  handleOpenSettings,
}: {
  mediaDevices: UserMedia;
  handleOpenSettings: () => void;
}) => {
  return (
    <>
      <Tooltip title={"Device Settings"} placement="top">
        <button className={styles.settingsButton} onClick={handleOpenSettings}>
          <SettingsIcon />
        </button>
      </Tooltip>
    </>
  );
};

const IconContainer = ({ children }: { children: ReactChild }) => (
  <div className="mx-md-1 my-md-1">{children}</div>
);

const FullScreenButton = ({
  fullScreenElement,
}: {
  fullScreenElement?: HTMLElement | null;
}) => {
  const { isFullScreen, toggleFullScreen } = useFullScreen(fullScreenElement);

  return (
    <Tooltip
      title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      placement="top"
    >
      <button className={styles.settingsButton} onClick={toggleFullScreen}>
        {isFullScreen && <FullscreenExitIcon />}
        {!isFullScreen && <FullscreenIcon />}
      </button>
    </Tooltip>
  );
};

const ShareButton = ({ open }: { open: () => void }) => {
  return (
    <Tooltip title={"Share"} placement="top">
      <button className={styles.shareButton} onClick={open}>
        share <SendIcon />
      </button>
    </Tooltip>
  );
};

const CaptureScreenshotButton = ({
  captureScreenshot,
}: {
  captureScreenshot: (() => Promise<string>) | undefined;
}) => {
  if (!captureScreenshot) return null;

  return (
    <Tooltip title={"Capture Screenshot"} placement="top">
      <button className={styles.settingsButton} onClick={captureScreenshot}>
        <PhotoCamera />
      </button>
    </Tooltip>
  );
};

type FooterMenuProps = {
  refreshAvailableDevices: () => void;
  broadcasting: BroadcastingControlsState;
  userMedia: UserMedia;
  handleOpenSettings: () => void;
  fullScreenElement: HTMLElement | null;
  openShareDialog: () => void;
  captureScreenshot?: () => Promise<any>;
};

const FooterMenuButtons = ({
  broadcasting,
  userMedia,
  handleOpenSettings,
  fullScreenElement,
  openShareDialog,
  captureScreenshot,
}: FooterMenuProps) => {
  return (
    <>
      <IconContainer key="webcam">
        <MediaDevicePauseAvatar
          resumeText="Webcam Off"
          pauseText="Webcam On"
          userMedia={userMedia.webcam}
          offIcon={<VideocamOffIcon className={styles.icon} />}
          onIcon={<VideocamIcon className={styles.icon} />}
        />
      </IconContainer>
      <IconContainer key="mic">
        <MediaDevicePauseAvatar
          resumeText="Microphone Off"
          pauseText="Microphone On"
          userMedia={userMedia.mic}
          offIcon={<MicOffIcon className={styles.icon} />}
          onIcon={<MicIcon className={styles.icon} />}
        />
      </IconContainer>
      {broadcasting.canManuallyBroadcast && (
        <IconContainer key="broadcast">
          <BroadcastingControls {...broadcasting} />
        </IconContainer>
      )}
      <IconContainer key="settings">
        <SettingsAvatar
          mediaDevices={userMedia}
          handleOpenSettings={handleOpenSettings}
        />
      </IconContainer>
      <IconContainer key="fullScreen">
        <FullScreenButton fullScreenElement={fullScreenElement} />
      </IconContainer>
      <IconContainer key="captureScreenshot">
        <CaptureScreenshotButton captureScreenshot={captureScreenshot} />
      </IconContainer>
      <IconContainer key="share">
        <ShareButton open={openShareDialog} />
      </IconContainer>
    </>
  );
};

const empty = {};

const FooterControls = memo(
  ({
    joystickMove,
    openProfileModule,
    peerMetadata$,
    sidebarOpen,
    disableUserMediaControls,
    hide,
    ...footerMenuProps
  }: {
    refreshAvailableDevices: () => void;
    openProfileModule: () => void;
    joystickMove: HandleJoystickMove;
    peerMetadata$: Observable<PossiblyNullStringDict>;
    sidebarOpen: boolean;
    disableUserMediaControls: boolean;
    hide?: boolean;
  } & FooterMenuProps) => {
    const cols = useMemo(
      () => ({
        joystick: {
          xs: 6,
          // sm: 3,
          // md: 2,
          lg: 4,
        },
        footerControls: {
          // sm: 6,
          // md: 8,
        },
        instructions: {
          lg: 4,
        },
        selfView: {
          xs: 6,
          // sm: 3,
          // md: 2,

          lg: 4,
        },
      }),
      []
    );

    const peerMetadata = useCurrentValueFromObservable(peerMetadata$, empty);

    return (
      <>
        <Container
          fluid
          className={clsx(
            styles.bottomBar,
            styles.bottomBarOffset,
            "p-0 m-0 fixed-bottom"
          )}
        >
          <Row
            className={clsx({
              [styles.hidden]: hide,
            })}
          >
            <Col
              {...cols.joystick}
              className={clsx(
                styles.joystickWrapper,
                styles.footerControlsCol,
                "align-items-center"
              )}
            >
              <Row
                className={clsx(
                  styles.joystickContainer,
                  "justify-content-start align-self-center align-items-center"
                )}
              >
                {!sidebarOpen && (
                  <JoystickController joystickMove={joystickMove} />
                )}
              </Row>
            </Col>
            <Col
              {...cols.instructions}
              className={clsx(
                "align-self-center d-none d-lg-block  align-items-center",
                styles.footerControlsCol
              )}
            >
              <Row className="justify-content-center">
                <Instructions />
              </Row>
            </Col>
            <Col
              {...cols.selfView}
              className={clsx(
                styles.videoContainer,
                styles.clickable,
                styles.footerControlsCol,
                "justify-content-md-end align-items-end"
              )}
            >
              <Row className="justify-content-sm-end align-items-end">
                <div className={clsx(styles.mainControlsVideoContainer)}>
                  <div
                    className={clsx(
                      styles.mainControlsVideoElement,
                      styles.mainControlsVideo
                    )}
                    onClick={openProfileModule}
                  >
                    <SelfView peerMetadata={peerMetadata} />
                  </div>
                </div>
              </Row>
            </Col>
          </Row>
        </Container>
        <Container
          fluid
          className={clsx(styles.bottomBar, "p-0 m-0 fixed-bottom")}
        >
          <Row className="d-flex justify-content-center">
            <Col
              xs={12}
              sm={8}
              className={clsx(
                styles.clickable,
                "d-flex align-items-end justify-content-center py-3"
              )}
            >
              {!disableUserMediaControls && (
                <Row>
                  <FooterMenuButtons {...footerMenuProps} />
                </Row>
              )}
            </Col>
          </Row>
        </Container>
      </>
    );
  }
);

export default FooterControls;
