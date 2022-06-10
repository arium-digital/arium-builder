import React, { ChangeEvent, useCallback, useEffect } from "react";
import { useFiles } from "../../hooks/useSpaceFiles";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { useStyles } from "../../styles";
import { FormErrors } from "../../types";
import styles from "./styles.module.scss";

import { StoredFileLocation } from "../../../../shared/sharedTypes";
import Skeleton from "@material-ui/lab/Skeleton";
import { Box, Grid } from "@material-ui/core";
import { Reference } from "db";
import { useState } from "react";
import { LoadingStatus } from "types";

const PREVIEW_UNAVAILABLE_SRC =
  "https://dummyimage.com/320x180/cccccc/fff.png&text=Preview+Unavailable";

const FolderThumbnail = ({ file }: { file: Reference }) => {
  const [imgUrl, setImgUrl] = useState<string>();
  const [status, setStatus] = useState(LoadingStatus.loading);
  useEffect(() => {
    file
      .child(`${file.name}_thumbnail.jpg`)
      .getDownloadURL()
      .then((url) => {
        setImgUrl(url);
        setStatus(LoadingStatus.done);
      })
      .catch((err) => {
        console.error(err);
        setStatus(LoadingStatus.failed);
      });
  }, [file]);

  if (status === LoadingStatus.loading)
    return <Skeleton width="160px" height="90px" />;
  return (
    <Box width="160px" height="90px">
      <img
        className={styles.fullSize}
        src={status === LoadingStatus.done ? imgUrl : PREVIEW_UNAVAILABLE_SRC}
        alt="thumbnail"
      />
    </Box>
  );
};

const StoredFileSelect = ({
  handleSelectFile,
  errors,
  file,
  allowEmpty,
  includeFolders,
  extensions,
  standardAssetsFolder,
  showThumbnail,
}: {
  showThumbnail?: boolean;
  handleSelectFile: (file: Partial<StoredFileLocation>) => void;
  errors?: FormErrors<StoredFileLocation>;
  file: StoredFileLocation;
  allowEmpty?: boolean;
  includeFolders: boolean | undefined;
  extensions: string[] | undefined;
  standardAssetsFolder: string | undefined;
}) => {
  const classes = useStyles();
  const hasError = !!errors?.fileName;
  // @ts-ignore
  const { files, refreshFiles, spaceId } = useFiles({
    standardAssetsFolder,
    extensions,
    includeFolders,
  });

  const [shouldRefreshFiles, setShouldRefreshFiles] = useState(false);

  useEffect(() => {
    if (shouldRefreshFiles) refreshFiles();
  }, [shouldRefreshFiles, refreshFiles]);

  useEffect(() => {
    // const fileUnique$ = file$.pipe(distinctUntilChanged(jsonStringifyChanges));
    // const filesUnique$ = files$.pipe(distinctUntilChanged(stringArrayChanged))

    // combineLatest([fileUnique$, filesUnique$]).pipe(switchMap(

    // ))
    // auto refresh when setting new files via drag-and-drop
    // potential risk for infinity loop sice refreshFiles sets files
    if (files && !files.map(({ name }) => name).includes(file.fileName)) {
      setShouldRefreshFiles(true);
    } else setShouldRefreshFiles(false);
  }, [file.fileName, files, refreshFiles]);

  const handleSelectChanged = useCallback(
    (event: ChangeEvent<{ value: unknown }>) => {
      if (event.target.value === "") {
        handleSelectFile({
          fileName: undefined,
          fileLocation: undefined,
          spaceId: undefined,
        });
      } else {
        const fileName = event.target.value as string;
        const fileLocationUpdate = standardAssetsFolder
          ? {
              fileName,
              fileLocation: "standardAssets",
              folder: standardAssetsFolder,
            }
          : {
              fileName,
              fileLocation: "spaceAssets",
              folder: null,
              spaceId,
            };
        // @ts-ignore
        handleSelectFile(fileLocationUpdate);
      }
    },
    [handleSelectFile, spaceId, standardAssetsFolder]
  );

  return (
    <FormControl className={classes.formControlLarge} error={hasError}>
      <>
        {!files && <Skeleton variant="rect" width={350} height={32} />}
        {files && (
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={file.fileName || ""}
            onChange={handleSelectChanged}
            style={{ flex: 1 }}
            className={classes.fullWidth}
          >
            {allowEmpty && (
              <MenuItem value={""} key={""}>
                --Select--
              </MenuItem>
            )}
            {files.map(({ name, otherSpace, fileRef }) => {
              return (
                <MenuItem value={name} key={name}>
                  <Grid container direction="column">
                    {showThumbnail && (
                      <Grid item>
                        <br />
                        <FolderThumbnail file={fileRef} />
                      </Grid>
                    )}
                    <Grid item>
                      {`${name}${
                        otherSpace ? ` (from ${otherSpace} space)` : ""
                      }`}
                    </Grid>
                  </Grid>
                </MenuItem>
              );
            })}
          </Select>
        )}
      </>
      {errors?.fileName && <FormHelperText>{errors?.fileName}</FormHelperText>}
    </FormControl>
  );
};

export default StoredFileSelect;
