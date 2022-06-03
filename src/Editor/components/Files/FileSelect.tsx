import { useCallback, memo } from "react";
import { FileLocation, PlaySettings } from "../../../spaceTypes";
import { FilesLookup } from "../../hooks/useSpaceFiles";
import InputLabel from "@material-ui/core/InputLabel";
import { useStyles } from "../../styles";
import { FormErrors } from "../../types";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import StorageIcon from "@material-ui/icons/Storage";
import PublicIcon from "@material-ui/icons/Public";
import Paper, { PaperProps } from "@material-ui/core/Paper";
import FreeTextField from "../Form/FreeTextField";
import {
  ExternalFileLocation,
  StoredFileLocation,
} from "../../../../shared/sharedTypes";
import StoredFileSelect from "./StoredFileSelect";
import { useConfigOrDefault } from "hooks/spaceHooks";
import {
  PreviewAndUploadModel,
  PreviewAndUploadVideo,
  PreviewAndUploadImage,
  PreviewAndUploadAudio,
} from "Editor/components/InSpaceForms/DragAndDropAndPreview";
import Grid from "@material-ui/core/Grid/Grid";
import { AcceptedFileTypes, Optional } from "types";
import { useEditingElementStatus } from "../Form/useEditingElementState";

const isExternalFile = (
  file?: FileLocation | null
): file is ExternalFileLocation => {
  if (!file) return false;
  return (file as ExternalFileLocation).fileType === "external";
};

const isStoredFile = (
  file?: FileLocation | null
): file is StoredFileLocation => {
  if (!file) return false;
  const fileType = (file as StoredFileLocation).fileType || "stored";
  return fileType === "stored";
};

// @ts-ignore
const defaultFile = (): StoredFileLocation => ({
  fileType: "stored",
});

type FileSelectProps = {
  disableDropZone?: boolean;
  disablePaper?: boolean;
  showThumbnail?: boolean;
  fieldName: string;
  file?: FileLocation | null;
  handleChanged: (updated?: FileLocation) => void;
  errors?: FormErrors<Optional<FileLocation>>;
  allowEmpty?: boolean;
  allowExternalFile?: boolean;
  allowGifs?: GLboolean;
  url?: string;
  acceptedTypesOverride?: AcceptedFileTypes;
  disabled?: boolean;
} & FilesLookup;

const FileSelectInner = ({
  fieldName,
  file,
  handleChanged,
  standardAssetsFolder,
  errors,
  extensions,
  allowEmpty,
  includeFolders,
  allowExternalFile,
  showThumbnail,
  disabled,
}: FileSelectProps & Pick<PaperProps, "elevation">) => {
  const classes = useStyles();

  const values = useConfigOrDefault(file, defaultFile);

  const handleSelectFile = useCallback(
    (fileLocationUpdate: Partial<StoredFileLocation>) => {
      // @ts-ignore
      handleChanged({
        ...values,
        ...fileLocationUpdate,
      });
    },
    [values, handleChanged]
  );

  const changeFileType = useCallback(
    (event: React.MouseEvent<HTMLElement>, newFileType: string) => {
      handleChanged({
        ...values,
        // @ts-ignore
        fileType: newFileType,
      });
    },
    [values, handleChanged]
  );

  const handleUrlChanged = useCallback(
    (url: string | undefined) => {
      // @ts-ignore
      handleChanged({
        ...values,
        // @ts-ignore
        url,
      });
    },
    [values, handleChanged]
  );

  const fileType = values?.fileType || "stored";

  return (
    <Grid container>
      <Grid item xs={12}>
        <InputLabel id="demo-simple-select-label">{fieldName}</InputLabel>
        {allowExternalFile && (
          <ToggleButtonGroup
            size="small"
            value={fileType}
            exclusive
            onChange={changeFileType}
            aria-label="text alignment"
            className={classes.grouped}
          >
            <ToggleButton
              value="stored"
              aria-label="left aligned"
              title="File Stored on Arium"
              disabled={disabled}
            >
              <StorageIcon />
            </ToggleButton>
            <ToggleButton
              value="external"
              aria-label="centered"
              title="External File (IPFS url)"
              disabled={disabled}
            >
              <PublicIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {isExternalFile(values) && (
          <FreeTextField
            value={values.url}
            setValue={handleUrlChanged}
            // @ts-ignore
            error={errors?.url}
            size="xl"
            help="The external url for this file"
          />
        )}
        {isStoredFile(values) && (
          <StoredFileSelect
            showThumbnail={showThumbnail}
            handleSelectFile={handleSelectFile}
            errors={errors as FormErrors<StoredFileLocation>}
            file={values}
            allowEmpty={allowEmpty}
            extensions={extensions}
            standardAssetsFolder={standardAssetsFolder}
            includeFolders={includeFolders}
          />
        )}
      </Grid>
    </Grid>
  );
};

export const Model = (props: FileSelectProps) => {
  const { file, handleChanged } = props;
  const { locked } = useEditingElementStatus();

  return (
    <Grid container>
      <Grid item xs={12}>
        <FileSelect {...props} disabled={locked} />
      </Grid>
      <Grid item xs={12}>
        <PreviewAndUploadModel
          {...{
            file: file || undefined,
            handleUpdateFile: handleChanged,
            disabled: locked,
          }}
        />
      </Grid>
    </Grid>
  );
};

const imageExtensions = ["png", "jpg", "gif", "jpeg"];

export const Image = memo(
  (
    props: FileSelectProps & {
      shapeDetermined?: (shape: { width: number; height: number }) => void;
    }
  ) => {
    const {
      file,
      handleChanged,
      acceptedTypesOverride: dropzoneAcceptedTypesOverride,
      allowGifs: allowGif,
    } = props;
    const { locked } = useEditingElementStatus();

    const acceptedFileTypes = dropzoneAcceptedTypesOverride
      ? Array.from(dropzoneAcceptedTypesOverride.extensions)
      : allowGif
      ? ["gif", ...imageExtensions]
      : imageExtensions;
    return (
      <Grid container>
        <Grid item xs={12}>
          <FileSelect
            {...props}
            extensions={acceptedFileTypes}
            disabled={locked}
          />
        </Grid>
        <Grid item xs={12}>
          <PreviewAndUploadImage
            {...{
              dropzoneAcceptedTypesOverride,
              file: file || undefined,
              handleUpdateFile: handleChanged,
              shapeDetermined: props.shapeDetermined,
              disabled: locked,
            }}
          />
        </Grid>
      </Grid>
    );
  }
);

export const Video = memo(
  (props: FileSelectProps & { playSettings?: PlaySettings }) => {
    const { file, handleChanged } = props;
    const { locked } = useEditingElementStatus();
    return (
      <Grid container>
        <Grid item xs={12}>
          <FileSelect {...props} disabled={locked} />
        </Grid>
        <Grid item xs={12}>
          <PreviewAndUploadVideo
            {...{
              file: file || undefined,
              handleUpdateFile: handleChanged,
              disabled: locked,
              // playSettings,
            }}
          />
        </Grid>
      </Grid>
    );
  }
);

export const Audio = memo(
  (props: FileSelectProps & { playSettings?: PlaySettings }) => {
    const { file, handleChanged } = props;
    const { locked } = useEditingElementStatus();
    return (
      <Grid container>
        <Grid item xs={12}>
          <FileSelect {...props} disabled={locked} />
        </Grid>
        <Grid item xs={12}>
          <PreviewAndUploadAudio
            {...{
              file: file || undefined,
              handleUpdateFile: handleChanged,
              disabled: locked,
              // playSettings,
            }}
          />
        </Grid>
      </Grid>
    );
  }
);

const FileSelect = (props: FileSelectProps) => {
  // @ts-ignore
  const classes = useStyles();

  return (
    <>
      {props.disablePaper ? (
        <FileSelectInner {...props} />
      ) : (
        <Paper className={classes.paper}>
          <FileSelectInner {...props} />
        </Paper>
      )}
    </>
  );
};

export default FileSelect;
