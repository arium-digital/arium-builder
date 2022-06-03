import {
  FileLocation,
  ImageConfig,
  ModelConfig,
  VideoConfig,
} from "spaceTypes";
import { useFrame, useThree } from "@react-three/fiber";
import { memo, useState, useCallback, useEffect } from "react";
import ModelContainer from "components/Elements/Model";
import { OrbitControls as ThreeOrbitControls } from "three-stdlib/controls/OrbitControls";
import ElementPreview from "./ElementPreview";
import ImageDisplay from "components/Elements/ImageDisplay";
import VideoPlayer, {
  useRefreshVideoIfSourceChanged,
} from "components/Elements/Video/VideoElement";
import RawModelDisplay from "components/Elements/Model/RawModelDisplay";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import IconButton from "@material-ui/core/IconButton";
import { useFileDownloadUrl } from "fileUtils";
import { NftConfig } from "spaceTypes/nftConfig";
import NftDisplay from "components/Elements/Nft/NftDisplay";
import { useBehaviorSubjectFromCurrentValue } from "hooks/useObservable";

export const Model = () => {
  const {
    camera,
    gl: { domElement },
  } = useThree();
  const controls = new ThreeOrbitControls(camera, domElement);
  useFrame(() => {
    controls.update();
  });
  return null;
};

export const usePreviewElementValues = () => {
  const alwaysFalse$ = useBehaviorSubjectFromCurrentValue(false);

  return {
    elementId: "",
    enablePointerOverLayer$: alwaysFalse$,
    disableInteractivity$: alwaysFalse$,
  };
};

export const ModelPreview = ({
  fileLocation,
  spaceId,
}: {
  fileLocation: FileLocation | undefined;
  spaceId: string;
}) => {
  const [loaded, setLoaded] = useState(false);

  const fileUrl = useFileDownloadUrl(fileLocation);

  if (!fileUrl) return null;
  return (
    <ElementPreview loaded={loaded}>
      <RawModelDisplay fileUrl={fileUrl} handleLoaded={setLoaded} />
    </ElementPreview>
  );
};

export const ModelElement = ({
  config,
  handleLoaded,
}: {
  config: ModelConfig;
  handleLoaded?: (loaded: boolean) => void;
}) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!handleLoaded || !loaded) return;

    handleLoaded(true);
  }, [loaded, handleLoaded]);

  const previewValues = usePreviewElementValues();

  return (
    <ElementPreview loaded={loaded}>
      <ModelContainer
        config={config}
        handleLoaded={setLoaded}
        {...previewValues}
      />
    </ElementPreview>
  );
};

export const Image = memo(({ config }: { config: ImageConfig }) => {
  const [loaded, setLoaded] = useState(false);
  const previewValues = usePreviewElementValues();

  return (
    <ElementPreview loaded={loaded}>
      <ImageDisplay
        config={config}
        handleLoaded={setLoaded}
        {...previewValues}
      />
    </ElementPreview>
  );
});

export const Nft = memo(({ config }: { config: NftConfig }) => {
  const [loaded, setLoaded] = useState(false);
  const previewValues = usePreviewElementValues();

  const [muted, setMuted] = useState(true);

  const toggleMuted = useCallback(() => {
    setMuted((existing) => !existing);
  }, []);

  useEffect(() => {
    setLoaded(false);
  }, [config.token]);

  return (
    <>
      <ElementPreview loaded={loaded}>
        <NftDisplay
          config={config}
          {...previewValues}
          handleLoaded={setLoaded}
          muted={muted}
        />
      </ElementPreview>
      <MutedToggle muted={muted} toggleMuted={toggleMuted} />
    </>
  );
});

const MutedToggle = ({
  muted,
  toggleMuted,
}: {
  muted: boolean;
  toggleMuted: () => void;
}) => (
  <IconButton onClick={toggleMuted}>
    {muted && <VolumeOffIcon />}
    {!muted && <VolumeUpIcon />}
  </IconButton>
);

const VideoInner = ({ config }: { config: VideoConfig }) => {
  const [loaded, setLoaded] = useState(false);

  const [muted, setMuted] = useState(true);
  const previewValues = usePreviewElementValues();

  const toggleMuted = useCallback(() => {
    setMuted((existing) => !existing);
  }, []);

  return (
    <>
      <ElementPreview loaded={loaded}>
        <VideoPlayer
          config={config}
          lastActive={undefined}
          handleLoaded={setLoaded}
          muted={muted}
          elementTransform={undefined}
          {...previewValues}
        />
      </ElementPreview>
      <MutedToggle muted={muted} toggleMuted={toggleMuted} />
    </>
  );
};

export const Video = ({ config }: { config: VideoConfig }) => {
  const refresh = useRefreshVideoIfSourceChanged(config);

  if (refresh) return null;

  return <VideoInner config={config} />;
};
