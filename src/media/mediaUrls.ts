// import { Cloudinary } from "@cloudinary/base";
// import { scale } from "@cloudinary/base/actions/resize";
import { imageKitBaseUrl } from "config";
import {
  DEFAULT_IN_SPACE_IMAGE_QUALITY,
  DEFAULT_IN_SPACE_IMAGE_RESOLUTION,
  DEFAULT_VIDEO_THUMBNAIL_WIDTH,
} from "defaultConfigs";
import { isStoredFile } from "fileUtils";
import {
  ExternalFileLocation,
  FileLocation,
  StoredFileLocation,
} from "../../shared/sharedTypes";
import { getAssetFolder, getAssetPath } from "./assetPaths";

interface MediaOptions {
  maxWidth?: number;
  quality?: number;
}

// const defaultImageSize = 1200;
export const getImageResizeUrl = (
  fileLocation: FileLocation,
  options: MediaOptions
) => {
  if (isStoredFile(fileLocation))
    return getStoredFileResizeUrl(fileLocation, options);

  return getExternalFileResizeUrl(fileLocation, options);
  // if (isExternalFile(fileLocation)) return getExterna

  // return null;
};

const getStoredFileResizeUrl = (
  fileLocation: StoredFileLocation,
  options: MediaOptions
) => {
  if (!fileLocation.fileName) return;

  const folder = getAssetFolder(fileLocation);

  const {
    quality = DEFAULT_IN_SPACE_IMAGE_QUALITY,
    maxWidth = DEFAULT_IN_SPACE_IMAGE_RESOLUTION,
  } = options;

  const path = `${folder || ""}${fileLocation.fileName || ""}`;

  return `${imageKitBaseUrl}tr:w-${maxWidth}${
    quality < 100 ? `,q-${quality}` : ""
  }/${path}`;
};

function getExternalFileResizeUrl(
  fileLocation: ExternalFileLocation,
  options: MediaOptions
) {
  return fileLocation.url;
}

const getThumbnailBaseUrl = () => {
  const mediaDomain = process.env.NEXT_PUBLIC_THUMBNAIL_HOST;

  if (!mediaDomain) return null;

  return `${mediaDomain}/thumbnail`;
};

function getThumbnailBaseUrlWithAssetPath(assetPath: string) {
  const baseUrl = getThumbnailBaseUrl();

  if (!baseUrl) return null;

  return `${baseUrl}/${assetPath}`;
}

function getThumbnailUrlPath(fileLocation: FileLocation) {
  if (isStoredFile(fileLocation)) {
    const assetPath = getAssetPath(fileLocation);

    if (!assetPath) return null;

    const thumbnailBaseUrlWithAssetPath = getThumbnailBaseUrlWithAssetPath(
      assetPath
    );

    if (!thumbnailBaseUrlWithAssetPath) return null;

    return new URL(thumbnailBaseUrlWithAssetPath);
  } else {
    if (!fileLocation.url) return null;

    const baseUrl = getThumbnailBaseUrl();

    if (!baseUrl) return null;

    const url = new URL(baseUrl);
    url.searchParams.append("url", fileLocation.url);

    return url;
  }
}

export const getThumbnailUrl = (
  fileLocation: FileLocation,
  startTime = 0,
  resolutionWidth: number = DEFAULT_VIDEO_THUMBNAIL_WIDTH
) => {
  const url = getThumbnailUrlPath(fileLocation);

  if (!url) return null;

  url.searchParams.append("t", startTime.toString());
  url.searchParams.append("w", resolutionWidth.toString());

  return url.toString();
};
