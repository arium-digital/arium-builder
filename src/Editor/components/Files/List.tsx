import Typography from "@material-ui/core/Typography";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  SyntheticEvent,
} from "react";
import {
  DataGrid,
  ColDef,
  CellValue,
  DataGridProps,
} from "@material-ui/data-grid";
import Grid from "@material-ui/core/Grid";
import {
  spaceAssetPath,
  useFileMetadata,
  useFiles,
} from "../../hooks/useSpaceFiles";
import { DropzoneDialog } from "material-ui-dropzone";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Button from "@material-ui/core/Button";
import { useStyles } from "../../styles";
import LinearProgress, {
  LinearProgressProps,
} from "@material-ui/core/LinearProgress";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import { SpaceSettings } from "../../../types";
import { useConfigOrDefault } from "../../../hooks/spaceHooks";
import { store, storage as firebaseStorage, Storage } from "db";
import { defaultSpaceSettings } from "../../../defaultConfigs";
import { extractExt } from "fileUtils";
import {
  Card,
  CardContent,
  IconButton,
  Modal,
  Tab,
  Tabs,
  Toolbar,
} from "@material-ui/core";
import { DeleteRounded } from "@material-ui/icons";
import { WithConfirmationDialog } from "../Form";
import { Centered } from "Editor/components/InSpaceForms/SimplifiedFormBaseAndUtils";

interface FileUploadStatus {
  progress: number;
  completion?: "success" | "error";
}

/**
 *
 * @param name a file name like abc.txt or abc-v2.txt
 * @returns if file is not versioned, add `-v2` to the end of file name.
 * if it's already versioned, increment the version
 *
 * eg: abc.txt => abc-v2.txt
 *    abc-v4.txt => abc-v5.txt
 */
const getNextName = (name: string): string => {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) throw Error("filename doesnot contain extensition");
  const [fileName, ext] = [name.slice(0, dotIndex), name.slice(dotIndex)];
  const versionIndex = fileName.lastIndexOf("-v");
  if (versionIndex === -1) return `${fileName}-v2${ext}`;
  const [originalName, version] = [
    fileName.slice(0, versionIndex),
    fileName.slice(versionIndex + 2),
  ];
  return `${originalName}-v${parseInt(version) + 1}${ext}`;
};
/**
 * @param newFile
 * @returns A File with the same content but new name
 */
export const renameFileIfSameNameExists = async (
  newFile: File,
  spaceId: string,
  storage: Storage
): Promise<File> => {
  let name = newFile.name;
  while (true) {
    try {
      await storage.ref(spaceAssetPath(spaceId, name)).getMetadata();
      name = getNextName(name);
    } catch (error) {
      return new File([newFile], name, { type: newFile.type });
    }
  }
};
// source: https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const toSizeString = (value: CellValue) => {
  return formatBytes(Number(value));
};

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number; fileName: string }
) {
  return (
    <Box display="flex" alignItems="center">
      <Box minWidth={200}>
        <Typography variant="body2" color="textSecondary">
          {props.fileName}
        </Typography>
      </Box>
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

enum FileType {
  all = "all",
  video = "video",
  model = "model",
  image = "image",
}

const typeExtensions: Record<FileType, Set<string>> = {
  all: new Set(["mp4", "webm", "glb", "gltf", "jpg", "png", "jpeg"]),
  video: new Set(["mp4", "webm"]),
  model: new Set(["glb", "gltf"]),
  image: new Set(["jpg", "png", "jpeg"]),
};

const DeletionToolBar = (props: {
  fileIds: Array<string | number>;
  filesMetadata: Required<ReturnType<typeof useFileMetadata>>;
  onDeletionSuccess?: (
    deleted: Required<ReturnType<typeof useFileMetadata>>
  ) => void;
}) => {
  const { fileIds, filesMetadata, onDeletionSuccess } = props;

  const handleDeletion = useCallback(() => {
    const fileIdsSet = new Set(fileIds as string[]);
    const filtered = filesMetadata.filter((meta) => fileIdsSet.has(meta.id));
    const promises = filtered.map((meta) => meta.fileRef.delete());
    Promise.allSettled(promises).then((results) => {
      onDeletionSuccess && onDeletionSuccess(filtered);
    });
  }, [fileIds, filesMetadata, onDeletionSuccess]);
  return (
    <Box position="absolute" width="100%" zIndex={10}>
      <Paper>
        <Toolbar>
          <Typography>
            Selected{" "}
            {fileIds.length < 3
              ? fileIds.join(", ")
              : `${fileIds.length} files`}
          </Typography>
          <Box flexGrow={1} />
          <WithConfirmationDialog
            dialogConfig={
              fileIds.length === 1
                ? {
                    title: `Delete ${fileIds[0]}?`,
                    content:
                      "Please also make sure no elements are referencing it.",
                  }
                : {
                    title: `Delete ${fileIds.length} files?`,
                    content:
                      "Please also make sure no elements are referencing them.",
                  }
            }
          >
            <IconButton color="primary">
              <DeleteRounded />
            </IconButton>
            <Button>Cancel</Button>
            <Button onClick={handleDeletion} color="primary">
              Delete
            </Button>
          </WithConfirmationDialog>
        </Toolbar>
      </Paper>
    </Box>
  );
};
const Files = () => {
  const classes = useStyles();
  const [fileType, setFileType] = useState<FileType>(FileType.all);
  const handleSelectFileType = useCallback((e: any, val: FileType) => {
    setFileType(val);
  }, []);
  const [uploadOpened, setUploadOpened] = useState(false);

  const [spaceSettings, setSpaceSettings] = useState<SpaceSettings>();

  const { files: currentFiles, refreshFiles, spaceId } = useFiles({});

  const spaceSettingsOrDefault = useConfigOrDefault(
    spaceSettings,
    defaultSpaceSettings
  );

  // effect to update the spaceSettings from the database
  useEffect(() => {
    // listen to changes for the space settings
    const subscription = store
      .collection("spaces")
      .doc(spaceId)
      .onSnapshot((settings) => {
        setSpaceSettings(settings.data() as SpaceSettings);
      });

    return () => {
      subscription();
    };
  }, [spaceId]);

  const metadata = useFileMetadata(currentFiles);
  const metadataFilteredByType = useMemo(() => {
    return metadata.filter((item) => {
      return typeExtensions[fileType].has(extractExt(item.name) || "unknown");
    });
  }, [fileType, metadata]);

  const [columns, setColumns] = useState<ColDef[]>();

  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>(
    []
  );
  const hanldeRowSelect = useCallback<
    Required<DataGridProps>["onSelectionChange"]
  >((selection) => {
    setSelectedRowIds(selection.rowIds);
  }, []);

  const handleDeletionSuccess = useCallback(() => {
    refreshFiles();
    setSelectedRowIds([]);
  }, [refreshFiles]);

  const storage = useMemo(() => firebaseStorage(), []);

  const [uploadStatuses, setUploadStatuses] = useState<{
    [fileName: string]: FileUploadStatus;
  }>({});

  useEffect(() => {
    const columns: ColDef[] = [
      { field: "id", headerName: "name", width: 200 },
      {
        field: "size",
        headerName: "size",
        width: 120,
        valueFormatter: ({ value }) => toSizeString(value),
      },
      { field: "contentType", headerName: "type", width: 220 },
      { field: "updated", headerName: "Last modified", width: 200 },
    ];
    setColumns(columns);
  }, []);

  const handleUploadClicked = useCallback((e: SyntheticEvent) => {
    e.preventDefault();

    setUploadOpened(true);
  }, []);

  const uploadFiles = useCallback(
    (newFiles: File[]) => {
      if (!spaceId) return;
      newFiles.forEach(async (file) => {
        const newFile = await renameFileIfSameNameExists(
          file,
          spaceId,
          storage
        );
        const destinationPath = spaceAssetPath(spaceId, newFile.name);

        const status = storage.ref(destinationPath).put(newFile);

        setUploadStatuses((existing) => ({
          ...existing,
          [newFile.name]: {
            progress: 0,
          },
        }));

        status.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadStatuses((existing) => ({
              ...existing,
              [newFile.name]: {
                ...existing[newFile.name],
                progress,
              },
            }));
          },
          () => {
            // on error
            setUploadStatuses((existing) => ({
              ...existing,
              [newFile.name]: {
                ...existing[newFile.name],
                completion: "error",
              },
            }));
          },
          () => {
            // on success
            setUploadStatuses({});
            refreshFiles();
          }
        );
      });
    },
    [refreshFiles, spaceId, storage]
  );

  const handleSave = useCallback(
    (files: File[]) => {
      uploadFiles(files);
      setUploadOpened(false);
    },
    [uploadFiles]
  );

  return (
    <>
      <DropzoneDialog
        open={uploadOpened}
        onSave={handleSave}
        showPreviews={true}
        maxFileSize={spaceSettingsOrDefault.maxFileUploadSize || 200000000}
        filesLimit={20}
        inputProps={{
          // @ts-ignore
          webkitdirectory: true,
          mozdirectory: true,
        }}
        onClose={() => setUploadOpened(false)}
      />
      <Modal open={Object.keys(uploadStatuses).length > 0}>
        <Centered width="100vw" height="100vh">
          <Box width="80vw" maxWidth="800px">
            <Card>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Uploading {Object.entries(uploadStatuses).length} files...
                </Typography>
                {Object.entries(uploadStatuses).map(([fileId, status]) => (
                  <LinearProgressWithLabel
                    key={fileId}
                    value={status.progress}
                    fileName={fileId}
                  />
                ))}
              </CardContent>
            </Card>
          </Box>
        </Centered>
      </Modal>
      <Grid container spacing={3} style={{ maxWidth: "800px" }}>
        <Grid item xs={12}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h2">Files</Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                startIcon={<CloudUploadIcon />}
                onClick={handleUploadClicked}
              >
                Upload
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          {selectedRowIds.length > 0 && (
            <DeletionToolBar
              fileIds={selectedRowIds}
              filesMetadata={metadataFilteredByType}
              onDeletionSuccess={handleDeletionSuccess}
            />
          )}
          <Tabs
            value={fileType}
            onChange={handleSelectFileType}
            aria-label="simple tabs example"
          >
            {Object.values(FileType).map((val) => (
              <Tab label={val} value={val} key={val} />
            ))}
          </Tabs>
          {columns && (
            <DataGrid
              checkboxSelection
              className={classes.dataGrid}
              autoHeight
              rows={metadataFilteredByType}
              columns={columns}
              hideFooter={true}
              onSelectionChange={hanldeRowSelect}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default Files;
