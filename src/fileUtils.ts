import { FileLocation } from "./spaceTypes";
import { useState, useEffect } from "react";
import { getAssetPath } from "./media/assetPaths";
import {
  ExternalFileLocation,
  StoredFileLocation,
} from "../shared/sharedTypes";
import { storage } from "db";
import { Optional } from "types";
import { firebaseConfig } from "config";
// import { Loader, useLoader } from "@react-three/fiber";
// TODO there has got to be a better way of doing this...

export async function getBucketUrl(filePath: string) {
  const firebaseStorage = storage();
  const gsReference = firebaseStorage.refFromURL(
    `gs://${firebaseConfig.storageBucket}/${filePath}`
  );
  const downloadURL = await gsReference.getDownloadURL();
  return downloadURL;
}

export async function getDownloadUrl(
  filePath: string,
  ignoreCache = false
): Promise<string> {
  if (process.env.NEXT_PUBLIC_ASSETS_DOMAIN && !ignoreCache) {
    return Promise.resolve(
      `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/${filePath}`
    );
  }

  return getBucketUrl(filePath);
}

export const getFileDownloadUrlAsync = async (
  file: FileLocation,
  ignoreCache?: boolean
): Promise<string | undefined> => {
  //   const spaceId = await getSpaceId();
  if (isStoredFile(file)) {
    const filePath = getAssetPath(file);

    if (!filePath) return undefined;

    return getDownloadUrl(filePath, ignoreCache);
  }

  const externalFile = file as ExternalFileLocation;

  return externalFile.url;
};

// TODO this could be set to the backend bucket load balancer at some point, but that is more expensive for the moment...
export function getFileDownloadUrl(file: FileLocation, ignoreCache?: boolean) {
  //   const spaceId = await getSpaceId();
  if (isStoredFile(file)) {
    const filePath = getAssetPath(file);

    if (!filePath) return undefined;

    return getDownloadUrl(filePath, ignoreCache);
  }

  const externalFile = file as ExternalFileLocation;

  return externalFile.url;
}

export const isStoredFile = (
  file: FileLocation
): file is StoredFileLocation => {
  return file.fileType !== "external";
};
export const isExternalFile = (
  file: FileLocation
): file is ExternalFileLocation => {
  return file.fileType === "external";
};

export const hasConfiguredFile = (file: FileLocation | undefined): boolean => {
  if (!file) return false;

  if (isStoredFile(file)) {
    return !!file.fileName;
  }

  return !!file.url;
};

export const useFileDownloadUrl = (
  file: Optional<FileLocation>,
  ignoreCache?: boolean
) => {
  const [filePath, setFilePath] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      if (file) setFilePath(await getFileDownloadUrl(file, ignoreCache));
      else setFilePath(undefined);
    })();
    // return () => setFilePath(undefined);
  }, [file, ignoreCache]);

  return filePath;
};

export const useFileDownloadUrlWithLoaded = (
  file: Optional<FileLocation>,
  ignoreCache?: boolean
) => {
  const [{ filePath, loaded }, setFilePathAndLoaded] = useState<{
    filePath: string | undefined;
    loaded: boolean;
  }>({
    filePath: undefined,
    loaded: false,
  });

  useEffect(() => {
    setFilePathAndLoaded({
      filePath: undefined,
      loaded: false,
    });
  }, [file]);

  useEffect(() => {
    (async () => {
      if (file)
        setFilePathAndLoaded({
          filePath: await getFileDownloadUrl(file, ignoreCache),
          loaded: true,
        });
      else
        setFilePathAndLoaded({
          filePath: undefined,
          loaded: true,
        });
    })();
    // return () => setFilePath(undefined);
  }, [file, ignoreCache]);

  return { filePath, loaded };
};

// declare type LoaderResult<T> = T extends any[] ? Loader<T[number]> : Loader<T>;
// export const useLoaderFromFileLocation = <T>(
//   file: FileLocation | undefined,
//   loader: new () => LoaderResult<T>,
//   ignoreCache?: boolean
// )  => {
//   const fileUrl = useFileDownloadUrl(file, ignoreCache);

//   const loaded = useLoader(loader, fileUrl);
// }

const getFileName = (file: FileLocation) => {
  if ("fileName" in file) return file.fileName;
  if ("url" in file) return file.url;

  return undefined;
};

/**
 *
 * @param fileName filename must ends with extension.
 * @returns extension string excluding `.`
 *
 */
export const extractExt = (fileName?: string): string | undefined => {
  if (!fileName) return undefined;
  const lowerFileName = fileName.toLowerCase();
  const lastDot = lowerFileName.lastIndexOf(".");
  // if there is no file extension, return undefined
  // changed 4 to 5 because of .webm
  if (lastDot < lowerFileName.length - 5) return undefined;
  return lowerFileName.slice(lastDot + 1);
};
export const getFileExtension = (file: FileLocation) => {
  const fileName = getFileName(file);
  return extractExt(fileName);
};

export const extractFileName = (name: string): string => {
  const extIndex = name.lastIndexOf(".");
  if (extIndex > 0) return name.slice(0, name.lastIndexOf("."));
  return name;
};

export const getCDNUrl = (path: string): string =>
  `https://assets.vlts.pw/${path}`;
