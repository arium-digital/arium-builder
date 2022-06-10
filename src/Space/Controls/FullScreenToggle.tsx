import styles from "css/controls.module.scss";
import { useCallback, useEffect, useState } from "react";

export const useFullScreen = (fullScreenElement?: HTMLElement | null) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    function onFullScreenChange() {
      let full = document.fullscreenElement;
      if (full) {
        setIsFullScreen(true);
      } else {
        setIsFullScreen(false);
      }
    }

    document.addEventListener("fullscreenchange", onFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange);
    };
  }, [fullScreenElement]);

  const toggleFullScreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    } else {
      const toMakeFullScreen = fullScreenElement || document.documentElement;
      try {
        toMakeFullScreen.requestFullscreen();
      } catch (e) {
        console.error(e);
      }
    }
  }, [fullScreenElement]);

  return { isFullScreen, toggleFullScreen };
};

export const FullScreenToggle = ({
  fullScreenElement,
}: {
  fullScreenElement?: HTMLElement | null;
}) => {
  const { isFullScreen, toggleFullScreen } = useFullScreen(fullScreenElement);

  return (
    <button className={styles.fullScreenButton} onClick={toggleFullScreen}>
      <img
        src={
          isFullScreen
            ? "/images/icons/exit-fullscreen.svg"
            : "/images/icons/enter-fullscreen.svg"
        }
        alt="enter fullscreen"
      />
    </button>
  );
};

export const FullScreenTopRightContainer = ({
  fullScreenElement,
}: {
  fullScreenElement?: HTMLElement | null;
}) => (
  <div className={styles.fullscreenButtonContainer}>
    <FullScreenToggle fullScreenElement={fullScreenElement} />
  </div>
);

export default FullScreenToggle;
