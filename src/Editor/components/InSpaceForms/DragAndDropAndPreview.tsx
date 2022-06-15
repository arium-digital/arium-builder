import styles from "./styles.module.scss";
import { PlaySettings } from "spaceTypes";
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ImagePreview from "Editor/components/Form/ImagePreview";
import React from "react";
import firebase from "firebase";
import { extractExt } from "fileUtils";
import { useDropzone } from "react-dropzone";
import { placeholderImageFile } from "defaultConfigs";
import { useUploadAndSetAsset } from "../../../Space/InSpaceEditor/hooks/useUploadAndSetAsset";
import { ProgressBar } from "./ElementFormBaseAndUtils";
import { useSlackbarErrorMessage } from "hooks/useSlackbarErrorMessage";
import { StoredVideoPreview } from "Editor/components/Form/VideoPreview";
import {
  FileLocation,
  StoredFileLocation,
} from "../../../../shared/sharedTypes";
import { AcceptedFileTypes } from "types";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import { StoredAudioPreview } from "../Form/AudioPreview";

const acceptedImageExtensions = new Set(["jpg", "jpeg", "png"]);
const acceptedVideoExtensions = new Set(["webm", "mp4"]);
const acceptedModelExtensions = new Set(["glb"]);
const acceptedAudioExtensions = new Set(["mp3"]);

const formatAcceptedTypes = (types: AcceptedFileTypes): string =>
  `Accept: ${Array.from(types.extensions)
    .map((val) => "*." + val)
    .join(", ")}`;

const useAcceptedOrDefaul = (
  accepted: Partial<AcceptedFileTypes> | undefined,
  defaultValues: AcceptedFileTypes
): AcceptedFileTypes => {
  return useMemo(
    () => ({
      extensions: accepted?.extensions || defaultValues.extensions,
      MIMETypes: accepted?.MIMETypes || defaultValues.MIMETypes,
    }),
    [
      accepted?.MIMETypes,
      accepted?.extensions,
      defaultValues.MIMETypes,
      defaultValues.extensions,
    ]
  );
};

function useUpdateFileAndName(props: {
  showError: (msg: string) => void;
  acceptedExtensions: Set<string>;
  file: FileLocation | undefined;
  handleUpdateFile: (location: FileLocation) => void;
  accept: string;
}) {
  const {
    showError,
    acceptedExtensions,
    file,
    handleUpdateFile,
    accept,
  } = props;

  const [currentFile, setCurrentFile] = useState<FileLocation | undefined>(
    file
  );
  useEffect(() => {
    setCurrentFile(file);
  }, [file]);

  const spaceId = useContext(SpaceContext)?.spaceId;

  const uploadFile = useCallback(
    (data: firebase.storage.UploadTaskSnapshot) => {
      if (!spaceId) {
        console.error("space id is missing");
        return;
      }
      const ext = extractExt(data.ref.name);
      const location: StoredFileLocation = {
        fileLocation: "spaceAssets",
        fileType: "stored",
        spaceId,
        fileName: data.ref.name,
      };

      if (!ext || !acceptedExtensions.has(ext)) {
        showError(
          `Supported file type: ${Array.from(acceptedExtensions).join(", ")}`
        );
        return;
      } else {
        setCurrentFile(location);
        handleUpdateFile(location);
      }
    },
    [showError, spaceId, acceptedExtensions, handleUpdateFile]
  );
  const { progress, uploading, handleUploadAndSet } = useUploadAndSetAsset(
    spaceId,
    uploadFile,
    acceptedExtensions,
    showError
  );
  const { getRootProps, getInputProps } = useDropzone({
    accept,
    onDrop: handleUploadAndSet,
  });

  return { progress, uploading, getRootProps, getInputProps, currentFile };
}

export type PreviewAndUploadProps = {
  file: FileLocation | undefined;
  handleUpdateFile: (file: FileLocation) => void;
  dropzoneAcceptedTypesOverride?: AcceptedFileTypes;
  disabled?: boolean;
};

export const PreviewAndUploadImage = (
  props: PreviewAndUploadProps & {
    shapeDetermined?: (shape: { width: number; height: number }) => void;
  }
) => {
  const { file, handleUpdateFile } = props;

  const { ErrorUI, showError } = useSlackbarErrorMessage();
  const acceptedFileTypes = useAcceptedOrDefaul(
    props.dropzoneAcceptedTypesOverride,
    {
      extensions: acceptedImageExtensions,
      MIMETypes: "image/jpeg, image/png",
    }
  );
  const {
    progress,
    uploading,
    getRootProps,
    getInputProps,
    currentFile,
  } = useUpdateFileAndName({
    acceptedExtensions: acceptedFileTypes.extensions,
    accept: acceptedFileTypes.MIMETypes,
    file,
    handleUpdateFile,
    showError,
  });

  const isRGBE = useMemo<boolean>(() => {
    if (currentFile?.fileType === "stored")
      return extractExt(currentFile.fileName) === "hdr";
    return false;
  }, [currentFile]);

  return (
    <>
      {ErrorUI}
      <div {...getRootProps({ className: styles.dragAndDrop })}>
        <input {...getInputProps()} />
        <div>
          {uploading ? (
            <ProgressBar value={progress} />
          ) : currentFile ? (
            <ImagePreview
              file={currentFile}
              isRGBE={isRGBE}
              shapeDetermined={props.shapeDetermined}
            />
          ) : (
            <ImagePreview
              file={placeholderImageFile("Drop+an+image+file+here")}
            />
          )}
        </div>
        <p>
          Drag and drop an image or click to select
          <br />
          {formatAcceptedTypes(acceptedFileTypes)}
        </p>
      </div>
    </>
  );
};

export const PreviewAndUploadAudio = (
  props: PreviewAndUploadProps & {
    playSettings?: PlaySettings;
  }
) => {
  const { file, handleUpdateFile, playSettings } = props;

  const { showError, ErrorUI } = useSlackbarErrorMessage();
  const acceptedFileTypes = useAcceptedOrDefaul(
    props.dropzoneAcceptedTypesOverride,
    {
      extensions: acceptedAudioExtensions,
      MIMETypes: "audio/mpeg",
    }
  );
  const {
    progress,
    uploading,
    getRootProps,
    getInputProps,
    currentFile,
  } = useUpdateFileAndName({
    acceptedExtensions: acceptedFileTypes.extensions,
    accept: acceptedFileTypes.MIMETypes,
    file,
    handleUpdateFile,
    showError,
  });

  return (
    <>
      {ErrorUI}
      <div {...getRootProps({ className: styles.dragAndDrop })}>
        <input {...getInputProps()} />
        <div>
          {uploading ? (
            <ProgressBar value={progress} />
          ) : currentFile ? (
            <StoredAudioPreview
              playSettings={playSettings}
              audioSource={currentFile}
            />
          ) : (
            <ImagePreview
              file={placeholderImageFile("Drop+an+audio+file+here")}
            />
          )}
        </div>
        <p>
          Drag and drop a video or click to select
          <br />
          {formatAcceptedTypes(acceptedFileTypes)}
        </p>
      </div>
    </>
  );
};

export const PreviewAndUploadVideo = (
  props: PreviewAndUploadProps & {
    playSettings?: PlaySettings;
  }
) => {
  const { file, handleUpdateFile, playSettings } = props;

  const { showError, ErrorUI } = useSlackbarErrorMessage();
  const acceptedFileTypes = useAcceptedOrDefaul(
    props.dropzoneAcceptedTypesOverride,
    {
      extensions: acceptedVideoExtensions,
      MIMETypes: "video/mp4, video/webm",
    }
  );
  const {
    progress,
    uploading,
    getRootProps,
    getInputProps,
    currentFile,
  } = useUpdateFileAndName({
    acceptedExtensions: acceptedFileTypes.extensions,
    accept: acceptedFileTypes.MIMETypes,
    file,
    handleUpdateFile,
    showError,
  });

  return (
    <>
      {ErrorUI}
      <div {...getRootProps({ className: styles.dragAndDrop })}>
        <input {...getInputProps()} />
        <div>
          {uploading ? (
            <ProgressBar value={progress} />
          ) : currentFile ? (
            <StoredVideoPreview
              playSettings={playSettings}
              videoSource={currentFile}
            />
          ) : (
            <ImagePreview
              file={placeholderImageFile("Drop+a+video+file+here")}
            />
          )}
        </div>
        <p>
          Drag and drop a video or click to select
          <br />
          {formatAcceptedTypes(acceptedFileTypes)}
        </p>
      </div>
    </>
  );
};

export const PreviewAndUploadModel = (props: PreviewAndUploadProps) => {
  const { file, handleUpdateFile } = props;

  const { showError, ErrorUI } = useSlackbarErrorMessage();

  const acceptedFileTypes = useAcceptedOrDefaul(
    props.dropzoneAcceptedTypesOverride,
    {
      extensions: acceptedModelExtensions,
      MIMETypes: ".glb",
    }
  );
  const {
    progress,
    uploading,
    getRootProps,
    currentFile,
    getInputProps,
  } = useUpdateFileAndName({
    acceptedExtensions: acceptedFileTypes.extensions,
    accept: acceptedFileTypes.MIMETypes,
    file,
    handleUpdateFile,
    showError,
  });

  return (
    <>
      {ErrorUI}
      <div {...getRootProps({ className: styles.dragAndDrop })}>
        {!currentFile && <input {...getInputProps()} />}
        <Suspense fallback={null}>
          {uploading ? (
            <ProgressBar value={progress} />
          ) : currentFile ? null : (
            <ImagePreview
              file={placeholderImageFile("Drop+a+model+file+here")}
            />
          )}
        </Suspense>
        <p>
          Drag and drop a model
          <br />
          {formatAcceptedTypes(acceptedFileTypes)}
        </p>
      </div>
    </>
  );
};
