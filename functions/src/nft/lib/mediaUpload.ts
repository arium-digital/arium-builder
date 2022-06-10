import { bucket } from "../../functions/media/fileUtils";
import { File } from "@google-cloud/storage";
import { FileLocation } from "../../../../shared/sharedTypes";
// import got from 'got';
import { tmpdir } from "os";
import { join } from "path";
import { createWriteStream, unlink } from "fs";
import request from "request";
import { promisify } from "util";
// import { spawn } from "child_process";
import { spawn } from "child_process";
import { MediaType } from "../../../../shared/nftTypes";

export const unlinkPromise = promisify(unlink);

const getStoredNftAssetPath = ({
  tokenId,
  tokenAddress,
  fileType,
  convertToVideo,
}: {
  tokenId: string;
  tokenAddress: string;
  fileType: string;
  convertToVideo: boolean;
}) => {
  const extension = convertToVideo ? "mp4" : fileType.split("/")[1];
  const extensionString = extension ? `.${extension}` : "";
  const result = `nft/${tokenAddress}/${tokenId}${extensionString}`;
  console.log({
    tokenAddress,
    tokenId,
    result,
  });
  return result;
};

const getStreamFromUrl = (url: string) => {
  return request(url);
};

function isGif(fileType: string) {
  return fileType.includes("gif");
}

export function uploadRemoteFile({
  fileUrl,
  fileType,
  file,
  storedFilePath,
  convertToVideo,
}: {
  fileUrl: string;
  fileType: string;
  file: File;
  storedFilePath: string;
  convertToVideo: boolean;
}) {
  console.log("downloading from ", fileUrl);
  const stream = request(fileUrl);
  stream.pause();

  if (convertToVideo) {
    console.log("converting gif to video");
    return new Promise<void>((resolve, reject) => {
      const pathParts = file.name.split("/");
      const tempPath = pathParts[pathParts.length - 1];
      const tempFilePath = join(tmpdir(), tempPath);
      console.log("temp path", tempFilePath);
      const ffmpeg = spawn("ffmpeg", [
        "-y",
        "-i",
        fileUrl,
        "-movflags",
        "faststart",
        "-pix_fmt",
        "yuv420p",
        "-vf",
        "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        tempFilePath,
      ]);
      ffmpeg.on("exit", async () => {
        console.log("file created...uploading");
        await bucket().upload(tempFilePath, {
          destination: storedFilePath,
          contentType: "video/mp4",
        });
        resolve();
      });

      ffmpeg.stdout.on("error", (err) => {
        console.error(err);
        reject();
      });

      // error logging
      ffmpeg.stderr.setEncoding("utf8");
      ffmpeg.stderr.on("data", (data) => {
        console.log(data);
      });
    });
  } else {
    return new Promise<void>((resolve, reject) => {
      const writeStream = file.createWriteStream({
        contentType: fileType,
        metadata: {
          contentType: fileType,
        },
      });
      stream.on("response", (res) => {
        if (res.statusCode !== 200) {
          reject();
          return;
        }

        stream
          .pipe(writeStream)
          .on("finish", () => {
            console.log("saved");
            resolve();
          })
          .on("error", (err) => {
            writeStream.end();
            console.error(err);
            reject();
          });

        // Resume only when the pipe is set up.
        stream.resume();
      });
    });
  }
}

export const downloadFile = (fileUrl: string, tempPath: string) => {
  const tempFilePath = join(tmpdir(), tempPath);

  const filePath = createWriteStream(tempFilePath);

  getStreamFromUrl(fileUrl).pipe(filePath);

  return new Promise<string>((resolve) => {
    filePath.on("finish", () => {
      filePath.close();

      resolve(tempFilePath);
    });
  });
};

export const getMediaType = (mimeType: string): MediaType => {
  if (mimeType.includes("video")) return "video";

  if (
    mimeType.includes("png") ||
    mimeType.includes("jpg") ||
    mimeType.includes("jpeg")
  )
    return "image";

  if (mimeType.includes("gif")) return "gif";

  if (mimeType.includes("video")) return "video";

  if (mimeType.includes("gltf") || mimeType.includes("glb")) return "model";

  if (mimeType.includes("svg")) return "svg";

  if (mimeType.includes("application")) return "application";

  return "other";
};

async function uploadTokenMedia({
  fileUrl,
  fileType,
  tokenId,
  tokenAddress,
}: {
  fileUrl: string;
  fileType: string;
  tokenId: string;
  tokenAddress: string;
}): Promise<{ location: FileLocation; fileType: string }> {
  console.log("fetchign!!!", { fileUrl });
  const mediaType = getMediaType(fileType);
  console.log({ fileType, mediaType });
  const saveInBucket = ["image", "video", "gif"].includes(mediaType);
  let fileLocation: FileLocation;

  let inSpaceType = fileType;

  if (saveInBucket) {
    const convertToVideo = isGif(fileType);
    const storedFilePath = getStoredNftAssetPath({
      tokenId,
      tokenAddress,
      fileType,
      convertToVideo: convertToVideo,
    });

    if (convertToVideo) {
      inSpaceType = "video/mp4";
    }

    console.log({ gif: convertToVideo, storedFilePath });

    const file = bucket().file(storedFilePath);

    const [fileExists] = await file.exists();

    if (!fileExists) {
      console.log("file doesnt exist, uploading");
      // const tempPath = `${tokenAddress}-${tokenId}`;
      // const savedFilePath = await downloadFile(fileUrl, tempPath);
      await uploadRemoteFile({
        fileUrl,
        fileType,
        file,
        storedFilePath,
        convertToVideo: convertToVideo,
      });
    }

    // await bucket().upload(fileUrl, {
    //   destination: storedFilePath

    // });

    // await unlinkPromise(savedFilePath);
    //   // await file.create()
    fileLocation = {
      fileType: "stored",
      fileName: storedFilePath,
      fileLocation: "global",
    };
    console.log({
      publicUrl: file.publicUrl(),
      fileExists,
      fileExistingsAfterChange: (await file.exists())[0],
    });
  } else {
    console.log("not copying file, just using external");
    fileLocation = {
      fileType: "external",
      url: fileUrl,
    };
  }

  return { location: fileLocation, fileType: inSpaceType };
}

export function ipfsToUrl(ipfs: string) {
  const pathParts = ipfs.split("/");
  const address = pathParts[pathParts.length - 1];

  return `https://ipfs.io/ipfs/${address}`;
}

export default uploadTokenMedia;
