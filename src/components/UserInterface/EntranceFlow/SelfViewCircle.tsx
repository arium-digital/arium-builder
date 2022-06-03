import AudioLevelIndicator from "../AudioLevelIndicator";
import SimpleVideoSelfView from "../Controls";
import styles from "../styles/entranceFlow.module.scss";
import clsx from "clsx";
import { Row } from "react-bootstrap";
import { useContext } from "react";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import { SelfAvatar } from "components/Consumers/SelfAvatar";

export const SelfViewRow: React.FC<{ showLogo?: boolean }> = ({
  children,
  showLogo = true,
}) => (
  <Row className={"justify-content-center py-5"}>
    <div className={clsx(styles.videoContainer)}>
      <div className={clsx(styles.videoElement, styles.logo)}>
        {showLogo && (
          <img src="/images/arium-logo-light.png" alt="the letter A" />
        )}
      </div>
      <div className={clsx(styles.videoElement)}></div>
      <div className={clsx(styles.videoElement, styles.video)}>{children}</div>
    </div>
  </Row>
);

const SelfView = ({ selfAvatar }: { selfAvatar: SelfAvatar }) => (
  <SelfViewRow>
    <AudioLevelIndicator volume$={selfAvatar.volume$} />
    <SimpleVideoSelfView videoTrack={selfAvatar.videoTrack || undefined} />
  </SelfViewRow>
);

const SelfViewWrapper = () => {
  const { selfAvatar } = useContext(SpaceContext) || {};

  if (!selfAvatar) return null;

  return <SelfView selfAvatar={selfAvatar} />;
};

export default SelfViewWrapper;
