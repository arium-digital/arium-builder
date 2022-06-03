import { useFileDownloadUrl } from "fileUtils";
import React, {
  useCallback,
  SyntheticEvent,
  useMemo,
  memo,
  useEffect,
} from "react";
import { FileLocation, ModelConfig } from "spaceTypes";
import { MediaSize } from "./types";
import { Skeleton } from "@material-ui/lab";
import clsx from "clsx";
import { useState } from "react";
import styles from "css/interactable.module.scss";
import { useRef } from "react";

import { ShowModalConfig } from "spaceTypes/interactable";
import ElementPreview from "Editor/components/Form/ElementPreview";
import { ModelWrapper } from ".";

type Vector2tuple = [number, number];

const VideoPreview = ({
  file,
  handleMediaSizeChanged,
  mediaElementSize,
  display,
}: {
  file: string;
  handleMediaSizeChanged: (mediaSize: MediaSize) => void;
  mediaElementSize: MediaSize | undefined;
  display: string;
}) => {
  const handleMetaDatLoaded = useCallback(
    (e: SyntheticEvent<HTMLVideoElement>) => {
      const element = e.target as HTMLVideoElement;
      const { videoWidth, videoHeight } = element;

      handleMediaSizeChanged({ width: videoWidth, height: videoHeight });
    },
    [handleMediaSizeChanged]
  );

  return (
    <>
      <video
        crossOrigin="anonymous"
        loop
        controls
        style={{ display }}
        src={file}
        autoPlay
        onLoadedMetadata={handleMetaDatLoaded}
        width={mediaElementSize?.width}
        height={mediaElementSize?.height}
      ></video>
    </>
  );
};

const ImagePreview = ({
  file,
  handleMediaSizeChanged,
  mediaElementSize,
  display,
}: {
  file: string;
  handleMediaSizeChanged: (mediaSize: MediaSize) => void;
  mediaElementSize: MediaSize | undefined;
  display: string;
}) => {
  const handleImageLoaded = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      const element = e.target as HTMLImageElement;
      const { width, height } = element;

      handleMediaSizeChanged({ width, height });
    },
    [handleMediaSizeChanged]
  );

  const [fullScreen, setFullScreen] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const [[offsetX, offsetY], setOffset] = useState<Vector2tuple>([0, 0]);

  const getOffset = useCallback((): Vector2tuple => {
    if (!ref.current) return [0, 0];
    const box = ref.current.getBoundingClientRect();
    return [-box.x, -0];
  }, []);
  const toggleFullScreen = useCallback(() => {
    setFullScreen((prev) => {
      if (prev) setOffset([0, 0]);
      else setOffset(getOffset());
      return !prev;
    });
  }, [getOffset]);
  return (
    <div className={clsx(styles.modalAssetContainer)}>
      <div className={clsx(styles.bg, fullScreen && styles.bgFullScreen)} />
      {mediaElementSize && (
        <button
          onClick={toggleFullScreen}
          className={clsx(
            styles.fullScreenBtn,
            fullScreen && styles.fullScreenBtnFullScreen
          )}
        >
          <img
            src={
              fullScreen
                ? "/images/icons/exit-fullscreen.svg"
                : "/images/icons/enter-fullscreen.svg"
            }
            alt="enter fullscreen"
          />
        </button>
      )}

      <img
        ref={ref}
        className={clsx(
          styles.modalAsset,
          fullScreen && styles.modalAssetFullScreen
        )}
        style={{ display, top: offsetY, left: offsetX }}
        crossOrigin="anonymous"
        src={file}
        alt="Detail View"
        width={mediaElementSize?.width}
        height={mediaElementSize?.height}
        onLoad={handleImageLoaded}
      />
    </div>
  );
};

const ModelPreview = ({
  file,
  handleMediaSizeChanged,
  mediaElementSize,
  display,
}: {
  file: string;
  handleMediaSizeChanged: (mediaSize: MediaSize) => void;
  mediaElementSize: MediaSize | undefined;
  display: string;
}) => {
  const config: ModelConfig = useMemo(
    () => ({
      modelFile: {
        fileType: "external",
        url: file,
      },
      bundledMaterial: true,
      materialConfig: undefined,
    }),
    [file]
  );

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (loaded) {
      handleMediaSizeChanged({ width: 1000, height: 1000 });
    }
  }, [loaded, handleMediaSizeChanged]);

  return (
    <div className={clsx(styles.modalAssetContainer)}>
      <ElementPreview loaded={loaded}>
        <ModelWrapper
          config={config}
          modelUrl={file}
          handleLoaded={setLoaded}
        />
      </ElementPreview>
    </div>
  );
};

const AssetDetails = memo(
  ({
    fileLocation,
    fileType = "image",
    handleMediaSizeChanged,
    mediaElementSize,
    showMediaElement,
  }: {
    fileLocation: FileLocation;
    fileType?: ShowModalConfig["detailFileType"];
    handleMediaSizeChanged: (mediaSize: MediaSize) => void;
    mediaElementSize: MediaSize | undefined;
    showMediaElement: boolean;
  }) => {
    const fileUrl = useFileDownloadUrl(fileLocation);

    if (!fileUrl) return null;

    const display = showMediaElement ? "flex" : "none";

    if (fileType === "image") {
      return (
        <ImagePreview
          file={fileUrl}
          handleMediaSizeChanged={handleMediaSizeChanged}
          mediaElementSize={mediaElementSize}
          display={display}
        />
      );
    }

    if (fileType === "video") {
      return (
        <VideoPreview
          file={fileUrl}
          handleMediaSizeChanged={handleMediaSizeChanged}
          mediaElementSize={mediaElementSize}
          display={display}
        />
      );
    }

    if (fileType === "model") {
      return (
        <ModelPreview
          file={fileUrl}
          handleMediaSizeChanged={handleMediaSizeChanged}
          mediaElementSize={mediaElementSize}
          display={display}
        />
      );
    }

    return null;
  }
);

const AssetDetailsOrSkeleton = (props: {
  fileLocation: FileLocation;
  fileType?: ShowModalConfig["detailFileType"];
  handleMediaSizeChanged: (mediaSize: MediaSize) => void;
  mediaElementSize: MediaSize | undefined;
  containerSize: MediaSize | undefined;
}) => {
  const { mediaElementSize, containerSize } = props;
  const showMediaElement = useMemo(() => {
    if (
      !containerSize ||
      !mediaElementSize ||
      !mediaElementSize.width ||
      !mediaElementSize.height
    ) {
      return false;
    }

    return true;
  }, [mediaElementSize, containerSize]);

  return (
    <>
      {!showMediaElement && (
        <Skeleton
          variant="rect"
          width={`${containerSize?.width || 400}px`}
          height={`${containerSize?.height || 400}px`}
        />
      )}
      <AssetDetails {...props} showMediaElement={showMediaElement} />
    </>
  );
};

export default AssetDetailsOrSkeleton;
