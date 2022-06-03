import {
  ExternalFileLocation,
  FileLocation,
  StoredFileLocation,
} from "../../../../shared/sharedTypes";
import * as temp from "temp";
import { storage } from "../../db";

export const isStoredFile = (
  file: FileLocation
): file is StoredFileLocation => {
  return file.fileType !== "external";
};

const addFolder = (folder?: string) => (folder ? `${folder}/` : "");

export const getAssetPath = (file: StoredFileLocation | undefined) => {
  if (!file || !file.fileName || file.fileName === "") return undefined;
  if (file.fileLocation === "spaceAssets") {
    return `spaceAssets/${file.spaceId}/${addFolder(file.folder)}${
      file.fileName
    }`;
  }

  if (file.fileLocation === "spaceUserAssets") {
    return `spaceUserAssets/${file.spaceId}/${addFolder(file.folder)}${
      file.fileName
    }`;
  }

  return `standardAssets/${addFolder(file.folder)}${file.fileName}`;
};

export const bucket = () => storage().bucket("volta-events-294715.appspot.com");

export async function getFileDownloadUrl(fileLocation: FileLocation) {
  //   const spaceId = await getSpaceId();
  if (isStoredFile(fileLocation)) {
    const assetPath = getAssetPath(fileLocation);

    if (!assetPath) return;

    const file = bucket().file(assetPath);
    const result = file.publicUrl();

    return result;
  }
  const externalFile = fileLocation as ExternalFileLocation;

  return externalFile.url;
}
export async function downloadTempFile(fileLocation: FileLocation) {
  //   const spaceId = await getSpaceId();
  if (isStoredFile(fileLocation)) {
    const assetPath = getAssetPath(fileLocation);

    if (!assetPath) return;

    const file = bucket().file(assetPath);
    const destination = temp.path({ suffix: ".mp4" });
    console.log("downloading to", { destination });
    await file.download({
      destination,
    });

    console.log("downloaded");

    return destination;
  }
  const externalFile = fileLocation as ExternalFileLocation;

  return externalFile.url;
}

export function getUploadStream(filePath: string) {
  console.log({ filePath });
  const file = bucket().file(filePath);

  const stream = file.createWriteStream({
    resumable: false,
    contentType: "video/mp4",
    // predefinedAcl: 'publicRead'
  });

  return stream;
}

export function upload({
  destination,
  filePath,
}: {
  destination: string;
  filePath: string;
}) {
  console.log("uploading", { filePath, destination });
  return bucket().upload(filePath, {
    destination,
    predefinedAcl: "publicRead",
  });
}
