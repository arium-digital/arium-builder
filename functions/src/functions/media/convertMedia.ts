import {
  FileLocation,
  StoredFileLocation,
} from "../../../../shared/sharedTypes";
import { getFileDownloadUrl } from "./fileUtils";
import ffmpeg from "fluent-ffmpeg";

import { promisify } from "util";
import {
  getMediaElementSizeToFit,
  getVideoSize,
  resizeAndUploadImage,
  resizeAndUploadVideo,
} from "./lib";

const ffprobe = promisify(ffmpeg.ffprobe);

type ConvertVideoParams = {
  fileLocation: FileLocation;
  maxVideoSize: number;
  maxImageSize: number;
  destinationVideoFile: StoredFileLocation;
  destinationImageFile: StoredFileLocation;
};

export const convertVideo = async ({
  fileLocation,
  maxVideoSize,
  maxImageSize,
  destinationImageFile,
  destinationVideoFile,
}: ConvertVideoParams) => {
  const fileUrl = await getFileDownloadUrl(fileLocation);

  if (!fileUrl) throw new Error("could not determine video url.");

  const ffprobeResults = (await ffprobe(fileUrl)) as ffmpeg.FfprobeData;

  const videoSize = getVideoSize(ffprobeResults);

  if (!videoSize) throw new Error("could not determine video size.");

  const targetVideoSize = getMediaElementSizeToFit({
    mediaSize: videoSize,
    maxSize: {
      maxSizeHeight: maxVideoSize,
      maxSizeWidth: maxVideoSize,
    },
  });

  const targetImageSize = getMediaElementSizeToFit({
    mediaSize: videoSize,
    maxSize: {
      maxSizeHeight: maxImageSize,
      maxSizeWidth: maxImageSize,
    },
  });

  const shouldConvertVideo =
    targetVideoSize.sizeDifferentFromOriginal ||
    ffprobeResults.format.format_name !== "h264";

  console.log({ shouldConvertVideo, targetVideoSize });

  const convertVideoPromise = shouldConvertVideo
    ? resizeAndUploadVideo({
        fileUrl,
        targetVideoSize,
        destination: destinationVideoFile,
      })
    : Promise.resolve(fileLocation);

  const [videoLocation, imageLocation] = await Promise.all([
    convertVideoPromise,
    resizeAndUploadImage({
      fileUrl,
      targetImageSize,
      destination: destinationImageFile,
    }),
  ]);

  return { videoLocation, imageLocation };
};
