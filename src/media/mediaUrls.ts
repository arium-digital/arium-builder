// import { Cloudinary } from "@cloudinary/base";
// import { scale } from "@cloudinary/base/actions/resize";
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
import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";

// const cld = new Cloudinary({
//   cloud: {
//     cloudName: "arium",
//   },
// });

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
export const cld = new Cloudinary({
  cloud: {
    cloudName: "arium",
  },
});
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

  return `https://ik.imagekit.io/arium/tr:w-${maxWidth}${
    quality < 100 ? `,q-${quality}` : ""
  }/${path}`;
};

function getExternalFileResizeUrl(
  fileLocation: ExternalFileLocation,
  options: MediaOptions
) {
  if (!fileLocation.url) return null;
  const {
    quality = DEFAULT_IN_SPACE_IMAGE_QUALITY,
    maxWidth = DEFAULT_IN_SPACE_IMAGE_RESOLUTION,
  } = options;
  return cld
    .image(fileLocation.url)
    .setDeliveryType("fetch")
    .setAssetType("image")
    .resize(scale().width(maxWidth))
    .quality(quality)
    .toURL();
}

export function gifToVideoUrl(fileUrl: string): any {
  const result = cld
    .video(fileUrl)
    .setDeliveryType("fetch")
    .setAssetType("image")
    .format("mp4")
    .toURL();

  return result;
}

const getThumbnailBaseUrl = () => {
  const mediaDomain =
    process.env.NEXT_PUBLIC_MEDIA_HOST || "https://im.vlts.pw";

  return `${mediaDomain}/thumbnail`;
};

function getThumbnailBaseUrlWithAssetPath(assetPath: string) {
  const baseUrl = getThumbnailBaseUrl();

  return `${baseUrl}/${assetPath}`;
}

function getThumbnailUrlPath(fileLocation: FileLocation) {
  if (isStoredFile(fileLocation)) {
    const assetPath = getAssetPath(fileLocation);

    if (!assetPath) return null;

    return new URL(getThumbnailBaseUrlWithAssetPath(assetPath));
  } else {
    if (!fileLocation.url) return null;

    const url = new URL(getThumbnailBaseUrl());
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
// const image = cld
//   .image(`${ folder } ${ fileLocation.fileName } `)
//   .resize(scale().width(options.maxWidth || defaultImageSize));

// return image.toURL(); //`https://res.cloudinary.com/arium/image/upload/w_${options.maxWidth || 1280}/${folder}${fileLocation.fileName}`;
// };

export const getImageResizeFromExternalUrl = (
  imageUrl: string,
  options: MediaOptions = {
    maxWidth: 1280,
  }
) => {
  return `https://res.cloudinary.com/demo/image/fetch/w_${
    options.maxWidth || 1280
  }/${imageUrl}`;
};
