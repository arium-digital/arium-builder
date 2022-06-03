import SpacePreview from "components/FullSpacePreview";
import React, { useCallback, useState } from "react";
import { spaceUserAssetPath } from "Editor/hooks/useSpaceFiles";
import randomString from "random-string";
import { useAuthentication } from "hooks/auth/useAuthentication";
import IconButton from "@material-ui/core/IconButton";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import CancelIcon from "@material-ui/icons/Cancel";
import { StoredFileLocation } from "../../../../shared/sharedTypes";
import Modal from "@material-ui/core/Modal";
import classes from "./styles.module.scss";
import { PartialRootState, ThreeContextType } from "types";
import { useCaptureAndUploadFromCanavs } from "libs/sceneCapture";
import CircularProgress from "@material-ui/core/CircularProgress";

const spaceUserUploadFileName = ({
  spaceId,
  userId,
}: {
  spaceId: string;
  userId: string;
}) => {
  const fileName = `default-meta-${randomString(8)}.jpg`;

  const filePath = spaceUserAssetPath(spaceId, userId, fileName);

  const fileLocation: StoredFileLocation = {
    fileType: "stored",
    fileLocation: "spaceUserAssets",
    spaceId,
    folder: userId,
    fileName,
  };

  return {
    filePath,
    fileName,
    fileLocation,
  };
};

export const useSceneCapture = ({
  spaceId,
  handlePathUpdated,
}: {
  spaceId: string | undefined;
  handlePathUpdated: (fileLocation: StoredFileLocation) => void;
}) => {
  const { userId } = useAuthentication({ ensureSignedInAnonymously: false });

  const generateFileName = useCallback(() => {
    if (!spaceId || !userId) return null;

    return spaceUserUploadFileName({
      spaceId,
      userId,
    });
  }, [spaceId, userId]);

  const [scene, setScene] = useState<PartialRootState | null>(null);

  const sceneContext: ThreeContextType = {
    setThree: setScene,
    three: scene,
  };

  const { uploading, captureAndSave } = useCaptureAndUploadFromCanavs({
    spaceId,
    userId,
    handlePathUpdated,
    generateFileName,
    three: scene,
  });

  return {
    uploading,
    captureAndSave,
    sceneContext,
  };
};

const SceneCapture = ({
  spaceId,
  cancel,
  uploading,
  captureAndSave,
}: {
  spaceId: string;
  cancel: () => void;
  uploading: boolean;
  captureAndSave: () => Promise<void>;
}) => {
  return (
    <Modal open={true}>
      <div className={classes.sceneCaptureModal}>
        <div style={{ position: "absolute", zIndex: 10000 }}>
          {!uploading && (
            <>
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                size="medium"
                onClick={captureAndSave}
              >
                <PhotoCamera fontSize="large" />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="cancel"
                component="span"
                size="medium"
                onClick={cancel}
              >
                <CancelIcon fontSize="large" />
              </IconButton>
            </>
          )}
          {uploading && <CircularProgress />}
        </div>
        <SpacePreview spaceId={spaceId} />
      </div>
    </Modal>
  );
};

export default SceneCapture;
