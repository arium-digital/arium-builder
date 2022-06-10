import { useCallback, useState, useMemo } from "react";
import { storage as firebaseStorage } from "db";
import { Optional, PartialRootState } from "types";
import { StoredFileLocation } from "../../shared/sharedTypes";

export const useCaptureFromCanavs = ({
  three,
}: {
  three: PartialRootState | null | undefined;
}) => {
  const camera = three?.camera;
  const gl = three?.gl;
  const scene = three?.scene;

  const captureScreenshot = useCallback(() => {
    if (!camera || !gl || !scene)
      throw new Error("missing camera, gl or scene");

    gl.render(scene, camera);

    const screenshot = gl.domElement.toDataURL("image/jpeg");

    return screenshot;
  }, [camera, gl, scene]);

  return {
    captureScreenshot,
  };
};

export const useCaptureAndUploadFromCanavs = ({
  userId,
  spaceId,
  handlePathUpdated,
  generateFileName,
  three,
}: {
  userId: Optional<string>;
  spaceId: Optional<string>;
  handlePathUpdated: (fileLocation: StoredFileLocation) => void;
  generateFileName: () => {
    filePath: string;
    fileName: string;
    fileLocation: StoredFileLocation;
  } | null;
  three: PartialRootState | null;
}) => {
  const { captureScreenshot: capture } = useCaptureFromCanavs({ three });

  const storage = useMemo(() => firebaseStorage(), []);

  const [uploading, setUploading] = useState(false);
  const [storedFile, setStoredFiale] = useState<StoredFileLocation | null>(
    null
  );

  const captureAndSave = useCallback(async () => {
    if (!userId || !spaceId) return;

    const capturedImageDataUrl = capture();

    const { filePath, fileName, fileLocation } = generateFileName() || {};

    if (!fileName || !filePath || !fileLocation || !capturedImageDataUrl)
      return;

    const status = storage
      .ref(filePath)
      .putString(capturedImageDataUrl, "data_url");

    setUploading(true);
    setStoredFiale(null);

    status.on(
      "state_changed",
      (snapshot) => {},
      () => {
        setUploading(false);
        // onerror
      },
      () => {
        // oncomplete

        setTimeout(() => {
          setUploading(false);
          setStoredFiale(fileLocation);
          if (handlePathUpdated) {
            handlePathUpdated(fileLocation);
          }
        }, 500);
      }
    );
  }, [capture, generateFileName, handlePathUpdated, spaceId, storage, userId]);

  return {
    captureAndSave,
    uploading,
    storedFile,
  };
};
