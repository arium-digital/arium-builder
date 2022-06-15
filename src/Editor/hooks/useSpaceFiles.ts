import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Reference, Storage, storage as firebaseStorage } from "db";
import { SpaceContext } from "hooks/useCanvasAndModalContext";

interface StorageFile {
  name: string;
  otherSpace?: string;
  fullPath: string;
  id: string;
  extension?: string;
  fileRef: Reference;
}

const parseExtension = (fileName: string) => {
  const parts = fileName.toLowerCase().split(".");
  return parts[parts.length - 1];
};

export const spaceAssetPath = (spaceId: string, fileName: string) =>
  `spaceAssets/${spaceId}/${fileName}`;

export const spaceUserAssetPath = (
  spaceId: string,
  userId: string,
  fileName: string
) => `spaceUserAssets/${spaceId}/${userId}/${fileName}`;

const hasValidExtension = (
  fileName: string,
  extensions?: string[]
): boolean => {
  if (!extensions) return true;

  const lowercaseName = fileName.toLowerCase();

  return extensions.includes(parseExtension(lowercaseName));
};

export type SpaceOrStandardAssets =
  | {
      standardAssetsFolder?: undefined;
    }
  | {
      standardAssetsFolder: string;
    };

export type FilesLookup = {
  extensions?: string[];
  includeFolders?: boolean;
} & SpaceOrStandardAssets;

const getSpaceAssetsFolder = (storage: Storage, spaceId: string) =>
  storage.ref(`spaceAssets`).child(spaceId);

const getFolderPaths = async ({
  spaceId,
  standardAssetsFolder,
  storage,
}: SpaceOrStandardAssets & {
  storage: Storage;
  spaceId: string | undefined;
}): Promise<Reference[]> => {
  if (standardAssetsFolder)
    return [storage.ref("standardAssets").child(standardAssetsFolder)];

  const id = spaceId as string;

  const spaceFolder = getSpaceAssetsFolder(storage, id);

  // const spaceSettingsDoc = await store.collection("spaces").doc(id).get();

  // if (!spaceSettingsDoc.exists) return [spaceFolder];

  // const spaceSettings = spaceSettingsDoc.data() as SpaceSettings;

  // if (!spaceSettings.accessToSpaceAssets) {
  //   return [spaceFolder];
  // }

  // const additionalFolders = spaceSettings.accessToSpaceAssets.map((spaceId) =>
  //   getSpaceAssetsFolder(storage, spaceId)
  // );

  return [spaceFolder /*, ...additionalFolders*/];
};

export const useFiles = ({
  standardAssetsFolder,
  extensions,
  includeFolders = false,
}: FilesLookup): {
  files?: StorageFile[];
  refreshFiles: () => void;
  spaceId: string | undefined;
} => {
  const storage = useMemo(() => firebaseStorage(), []);

  const [files, setFiles] = useState<StorageFile[]>();

  const spaceId = useContext(SpaceContext)?.spaceId;

  const refreshFiles = useCallback(async () => {
    // @ts-ignore
    const folderPaths = await getFolderPaths({
      spaceId,
      standardAssetsFolder,
      storage,
    });

    const files: StorageFile[] = [];

    for (let i = 0; i < folderPaths.length; i++) {
      const folderPath = folderPaths[i];
      const filesResults = await folderPath.listAll();

      filesResults.items.forEach(async (file) => {
        if (hasValidExtension(file.name, extensions))
          files.push({
            name: file.name,
            otherSpace: i > 0 ? folderPath.name : undefined,
            fullPath: file.fullPath,
            id: file.name,
            extension: parseExtension(file.name),
            fileRef: file,
          });
      });

      if (includeFolders) {
        for (const folder of filesResults.prefixes) {
          files.push({
            fullPath: folder.fullPath,
            name: folder.name,
            id: folder.name,
            fileRef: folder,
          });
        }
      }
    }

    setFiles(files);
  }, [spaceId, standardAssetsFolder, storage, includeFolders, extensions]);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  return { files, refreshFiles, spaceId };
};

interface FileWithMetaData extends StorageFile {
  size: number;
  contentType: string;
  updated: string;
}

export const useFileMetadata = (files: StorageFile[] | undefined) => {
  const storage = useMemo(() => firebaseStorage(), []);

  const [filesWithMetaData, setFilesWithMetaData] = useState<
    FileWithMetaData[]
  >([]);
  useEffect(() => {
    (async () => {
      if (!files) return;
      const withMetaData = await Promise.all(
        files.map(async (file) => {
          const metatadata = await storage.ref(file.fullPath).getMetadata();

          return {
            ...file,
            size: metatadata.size,
            contentType: metatadata.contentType,
            updated: metatadata.updated,
          };
        })
      );

      setFilesWithMetaData(withMetaData);
    })();
  }, [files, storage]);

  return filesWithMetaData;
};
