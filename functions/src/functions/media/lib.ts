import { StoredFileLocation } from "../../../../shared/sharedTypes";
import { upload } from "./fileUtils";
import ffmpeg from "fluent-ffmpeg";
import * as temp from "temp";

import { getAssetPath } from "../../../../src/media/assetPaths";

export function getVideoSize(probeResult: ffmpeg.FfprobeData) {
  const stream = probeResult.streams.find(
    (stream) => stream.codec_type === "video"
  );

  if (!stream || !stream.width || !stream.height) return;

  return {
    codec: stream.codec_name,
    width: stream.width as number,
    height: stream.height as number,
  };
}

export const getMediaElementSizeToFit = ({
  mediaSize,
  maxSize: { maxSizeHeight, maxSizeWidth },
}: {
  mediaSize: { width: number; height: number };
  maxSize: {
    maxSizeHeight: number;
    maxSizeWidth: number;
  };
}) => {
  // if media is smaller than target, then just return it
  if (mediaSize.width <= maxSizeWidth && mediaSize.height <= maxSizeHeight)
    return { ...mediaSize, sizeDifferentFromOriginal: false };

  // if video is taller than wide, make sure it fits in the box by making
  // its height smaller
  // const containerAspect = containerWidth / containerHeight;

  // const videoAspect = mediaSize.width / mediaSize.height;
  // if wider than tall
  const widthScale = maxSizeWidth / mediaSize.width;
  const heightScale = maxSizeHeight / mediaSize.height;
  let scale: number;
  if (widthScale < heightScale) {
    scale = widthScale;
  } else {
    scale = heightScale;
  }

  const width = Math.floor(scale * mediaSize.width);
  const height = Math.floor(scale * mediaSize.height);

  return { width, height, sizeDifferentFromOriginal: true };
};

const targetSizeString = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => `${width}x${height}`;

async function resizeVideo({
  fileUrl,
  targetVideoSize,
}: {
  fileUrl: string;
  targetVideoSize: { width: number; height: number };
}) {
  const tempDestination = temp.path({ suffix: ".mp4" });

  console.log("resizing video...");

  return new Promise<string>((resolve) => {
    ffmpeg()
      .input(fileUrl)
      .size(targetSizeString(targetVideoSize))
      .format("mp4")
      .videoCodec("libx264")
      .output(tempDestination)
      .on("end", () => {
        resolve(tempDestination);
      })
      .run(); //.pipe(writeStream, {end: true});
  });
}

export async function resizeAndUploadVideo({
  fileUrl,
  targetVideoSize,
  destination,
}: {
  fileUrl: string;
  targetVideoSize: { width: number; height: number };
  destination: StoredFileLocation;
}): Promise<StoredFileLocation> {
  const videoPath = await resizeVideo({ fileUrl, targetVideoSize });

  console.log("uploading video...");

  const desinationPath = getAssetPath(destination);

  if (!desinationPath)
    throw new Error(
      `Could not get desination path from destination ${destination}`
    );

  await upload({
    destination: desinationPath,
    filePath: videoPath,
  });

  console.log("uploaded video");

  return destination;
}

export async function resizeAndUploadImage({
  fileUrl,
  targetImageSize,
  destination,
}: {
  fileUrl: string;
  targetImageSize: { width: number; height: number };
  destination: StoredFileLocation;
}): Promise<StoredFileLocation> {
  const path = await resizeImage({
    fileUrl,
    targetImageSize,
  });
  console.log("uploading");

  const desinationPath = getAssetPath(destination);

  if (!desinationPath)
    throw new Error(
      `Could not get desination path from destination ${destination}`
    );

  await upload({
    destination: desinationPath,
    filePath: path,
  });

  console.log("uploaded");

  return destination;
}

export async function resizeImage({
  fileUrl,
  targetImageSize,
}: {
  fileUrl: string;
  targetImageSize: { width: number; height: number };
}) {
  const tmpImageFile = temp.path({ suffix: ".jpg" });

  return new Promise<string>((resolve, reject) => {
    ffmpeg()
      .input(fileUrl)
      .screenshot({
        filename: tmpImageFile,
        count: 1,
        folder: "/",
        size: targetSizeString(targetImageSize),
      })
      .on("end", () => {
        resolve(tmpImageFile);
      });
  });
}
