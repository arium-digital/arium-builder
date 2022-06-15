import { StoredFileLocation } from "../../shared/sharedTypes";

const addFolder = (folder?: string) => (folder ? `${folder}/` : "");

export const getAssetFolder = (file: StoredFileLocation | undefined) => {
  if (!file) return undefined;
  if (file.fileLocation === "spaceAssets") {
    return `spaceAssets/${file.spaceId}/${addFolder(file.folder)}`;
  }

  if (file.fileLocation === "spaceUserAssets") {
    return `spaceUserAssets/${file.spaceId}/${addFolder(file.folder)}`;
  }

  if (file.fileLocation === "standardAssets")
    return `standardAssets/${addFolder(file.folder)}`;

  return file.folder;
};

export const getAssetPath = (file: StoredFileLocation | undefined) => {
  if (!file || !file.fileName || file.fileName === "") return undefined;
  const folder = getAssetFolder(file);

  return `${folder || ""}${file.fileName || ""}`;
};
