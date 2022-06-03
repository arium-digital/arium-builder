import { spaceAssetPath } from "Editor/hooks/useSpaceFiles";
import { useCallback, useMemo, useState } from "react";
import firebase from "firebase";
import { storage as firebaseStorage } from "db";
import { extractExt } from "fileUtils";
import { renameFileIfSameNameExists } from "Editor/components/Files/List";

export const useUploadAndSetAsset = (
  spaceId: string | undefined,
  handleUseNewFile: (data: firebase.storage.UploadTaskSnapshot) => void,
  acceptedExtensions?: Set<string>,
  showError?: (errorMessage: string) => void
): {
  progress: number;
  uploading: boolean;
  handleUploadAndSet: (files: File[]) => void;
} => {
  const [uploadStatus, setUploadStatus] = useState({
    progress: 0,
    uploading: false,
  });
  const storage = useMemo(() => firebaseStorage(), []);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file) {
        showError && showError("Unsupported media type");
        return;
      }
      if (!spaceId) {
        console.error("missing space id");
        return;
      }

      if (
        acceptedExtensions &&
        !acceptedExtensions.has(extractExt(file.name) || "")
      ) {
        showError &&
          showError(
            `Only supports ${Array.from(acceptedExtensions).join(", ")}.`
          );
        return;
      }
      setUploadStatus({
        progress: 1,
        uploading: true,
      });

      const newFile = await renameFileIfSameNameExists(file, spaceId, storage);
      const destinationPath = spaceAssetPath(spaceId, newFile.name);
      const task = storage.ref(destinationPath).put(newFile);
      task.on(
        "state_changed",
        (snapshot: firebase.storage.UploadTaskSnapshot) => {
          setUploadStatus({
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            uploading: true,
          });
        }
      );
      task
        .then((data: firebase.storage.UploadTaskSnapshot) => {
          handleUseNewFile(data);
          setUploadStatus({ progress: 100, uploading: false });
        })
        .catch((err) => {
          setUploadStatus({ progress: 0, uploading: false });
          showError && showError(err);
        });
    },
    [acceptedExtensions, spaceId, storage, showError, handleUseNewFile]
  );

  const handleUploadAndSet = useCallback(
    (files: File[]) => {
      uploadFile(files[0]);
    },
    [uploadFile]
  );

  return { ...uploadStatus, handleUploadAndSet };
};
