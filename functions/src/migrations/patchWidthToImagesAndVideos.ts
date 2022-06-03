import * as admin from "firebase-admin";
import { parse } from "url";
import { get } from "https";
// @ts-ignore
import { Vector2tuple } from "three";
import fs from "fs";
// only run once so we can just install them adhocly
import sizeOf from "image-size";
import { Readable } from "stream";
const ffmpeg = require("fluent-ffmpeg");
const probPath = "/usr/local/bin/ffprobe";
ffmpeg.setFfprobePath(probPath);
process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";
admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket("volta-events-294715.appspot.com");
type DocumentRef = Omit<
  admin.firestore.DocumentReference,
  "listCollections" | "create"
>;
const errorConfigs: Record<string, any> = {};
const processing: Set<string> = new Set();
const known404s = [
  "https://storage.googleapis.com/volta-events-294715.appspot.com/spaceAssets/home/PromisedLand-CuratedText.jpg",
  "https://storage.googleapis.com/volta-events-294715.appspot.com/spaceAssets/home/ModularShortest.mp4",
  "https://storage.googleapis.com/volta-events-294715.appspot.com/spaceAssets/home/HackaTaoPromisedLandXmostra.mp4",
  "https://storage.googleapis.com/volta-events-294715.appspot.com/spaceAssets/home/Hackatao_Guercino_CAPTIONS.jpg",
  "https://storage.googleapis.com/volta-events-294715.appspot.com/spaceAssets/home/Guercino_Bartsch%20Adam_%281757-1821%29.jpg",
  "https://storage.googleapis.com/volta-events-294715.appspot.com/spaceAssets/hidden/The%20Hidden%20Lady%20ver%201%20.%20Hackatao%20open%202300.mp4",
  "https://www.hicetnunc.xyz/objkt/39376",
  "https://storage.googleapis.com/volta-events-294715.appspot.com/spaceAssets/home/PromisedLand-CuratedText.jpg",
];
const shouldSkip404 = (url: string): boolean => {
  for (const known404 of known404s) if (url.startsWith(known404)) return true;
  return false;
};
type Stream = { codec_type: "video" | "audio"; width: number; height: number };

const get_wh_from_metadata = (
  type: "video" | "image",
  metadata: { streams: Stream[] }
): Vector2tuple => {
  if (type === "video") {
    const { width, height } = metadata.streams.filter(
      (s: any) => s.codec_type === "video"
    )[0];
    return [width, height];
  } else {
    const { width, height } = metadata.streams[0];
    return [width, height];
  }
};

const memo = new Map<string, Vector2tuple>();
const probeWH = (
  url: string,
  type: "video" | "image"
): Promise<Vector2tuple> => {
  return new Promise((res, rej) => {
    if (memo.has(url)) res(memo.get(url) as Vector2tuple);
    ffmpeg.ffprobe(url, async function (err: any, metadata: any) {
      if (err) {
        try {
          const tryDownload = await downloadAndGetWH(url, type);
          memo.set(url, tryDownload);
          res(tryDownload);
        } catch (err) {
          rej(["failed to get WH twice,", type, url, err]);
        }
      } else {
        // metadata should contain 'width', 'height' and 'display_aspect_ratio'
        try {
          const [width, height] = get_wh_from_metadata(type, metadata);
          memo.set(url, [width, height]);
          res([width, height]);
        } catch (err) {
          console.log(url);
          console.error(err);
          rej(["probe success but error reading data", type, url, err]);
          rej(err);
        } finally {
        }
      }
    });
  });
};

const downloadAndGetWH = (
  url: string,
  type: "video" | "image"
): Promise<Vector2tuple> => {
  return new Promise((res, rej) => {
    get(parse(url), (response) => {
      if (response.statusCode === 404) {
        console.log(url, 404);
        rej("404: " + url);
      }
      const chunks: any[] = [];
      response
        .on("data", (chunk) => {
          chunks.push(chunk);
        })
        .on("end", () => {
          try {
            const buffer = Buffer.concat(chunks);
            if (type === "image") {
              const { width, height } = sizeOf(buffer);
              if (width && height) res([width, height]);
              else rej("cannot get width and height");
            } else {
              const readable = new Readable();
              readable.push(buffer);
              readable._read = () => {};
              ffmpeg.ffprobe(readable, (err: any, metadata: any) => {
                const [width, height] = get_wh_from_metadata(type, metadata);
                if (width && height) res([width, height]);
                else rej("cannot get width and height");
              });
            }
          } catch (err) {
            console.log(url);
            console.error(err);
            rej("cannot get width and height");
          }
        })
        .on("error", () => {
          rej("error reading image");
        });
    });
  });
};

type StoredFileLocation = {
  fileName: string;
  fileType: "stored";
  folder?: string;
} & (
  | {
      fileLocation: "spaceAssets";
      spaceId: string;
    }
  | {
      fileLocation: "standardAssets";
      spaceId?: undefined;
    }
  | {
      fileLocation: "spaceUserAssets";
      spaceId: string;
    }
);

type ExternalFileLocation = {
  fileType: "external";
  url: string;
};
const addFolder = (folder?: string) => (folder ? `${folder}/` : "");

type FileLocation = StoredFileLocation | ExternalFileLocation;
const getAssetPath = (file: StoredFileLocation | undefined) => {
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

async function getBucketUrl(filePath: string) {
  const gsReference = bucket.file(filePath);
  const downloadURL = await gsReference.getSignedUrl({
    action: "read",
    expires: "05-25-2021",
  });
  return downloadURL[0];
}

async function getDownloadUrl(
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

const isStoredFile = (file: FileLocation): file is StoredFileLocation => {
  return file.fileType !== "external";
};

function getFileDownloadUrl(file: FileLocation, ignoreCache?: boolean) {
  //   const spaceId = await getSpaceId();
  if (isStoredFile(file)) {
    const filePath = getAssetPath(file);

    //@ts-ignore
    if (!filePath) return file.url;

    return getDownloadUrl(filePath, ignoreCache);
  }

  const externalFile = file as ExternalFileLocation;

  return externalFile.url;
}
export type LiveStreamConfig = {
  muxPlaybackId?: string;
};

export type LiveStreamVideoConfig = {
  type: "stream";
  storedVideos?: undefined;
  liveStream?: LiveStreamConfig;
};

export interface StoredVideoFilesConfig {
  webm?: FileLocation;
  mp4?: FileLocation;
}

export type StoredVideoConfig = {
  type: "stored video";
  storedVideos?: StoredVideoFilesConfig;
  liveStream?: undefined;
};

type OptionalWidth = {
  width?: number;
};
type MinimalImageConfig = {
  imageFile?: FileLocation;
  scale?: number;
} & OptionalWidth;

type MinimalVideoConfig = {
  scale?: number;
} & OptionalWidth &
  (StoredVideoConfig | LiveStreamVideoConfig);
const pixelToSizeScale = 0.01;

type Result =
  | "skip already migrated"
  | "success"
  | "skip livestream"
  | "skip 404";

const processImage = async (
  doc: DocumentRef,
  spaceId: string,
  dryRun: boolean
): Promise<Result> => {
  const imageConfig: MinimalImageConfig = (await doc.get()).data()?.image;
  const { imageFile, scale = 1, width } = imageConfig;
  if (!imageFile && spaceId !== "yang") {
    errorConfigs[spaceId + "-" + doc.id] = imageConfig;
    throw Error(
      spaceId + ", image file is undefined: " + JSON.stringify(imageConfig)
    );
  }

  if (width) return "skip already migrated";
  const url = await getFileDownloadUrl(imageFile as FileLocation);
  if (!url) {
    errorConfigs[spaceId + "-" + doc.id] = imageConfig;
    throw Error(
      "cannot get download url: " + JSON.stringify(imageConfig.imageFile)
    );
  }
  if (shouldSkip404(url)) return "skip 404";
  const imgSize = await probeWH(url, "image");
  // @ts-ignore
  const [w] = imgSize.map((val) => val * pixelToSizeScale * scale);

  if (dryRun) {
    if (isNaN(w)) {
      throw Error("not a number");
    }
    // console.log(`update one image to ${w} x ${h}`);
    return "success";
  } else
    return doc
      .update({
        "image.width": w,
      })
      .then(() => "success");
};

// const muxUrl = (playbackId: string) =>
//   `https://stream.mux.com/${playbackId}.m3u8`;

const getVideoUrl = async (
  videoConfig: MinimalVideoConfig
): Promise<string> => {
  if (videoConfig.storedVideos?.webm && videoConfig.storedVideos?.mp4) {
    try {
      //@ts-ignore
      return getFileDownloadUrl(videoConfig.storedVideos.mp4);
    } catch {
      //@ts-ignore
      return getFileDownloadUrl(videoConfig.storedVideos.webm);
    }
  } else if (videoConfig.storedVideos?.webm)
    return getFileDownloadUrl(videoConfig.storedVideos.webm);
  else if (videoConfig.storedVideos?.mp4)
    return getFileDownloadUrl(videoConfig.storedVideos.mp4);
  else throw Error("webm and mp4 are both empty");
};

const processVideo = async (
  doc: DocumentRef,
  spaceId: string,
  dryRun: boolean
): Promise<Result> => {
  const videoConfig: MinimalVideoConfig = (await doc.get()).data()?.video;
  const { type, scale = 1, width } = videoConfig;
  if (type === "stream") return "skip livestream";
  if (width) return "skip already migrated";
  const url = await getVideoUrl(videoConfig);
  if (!url) {
    errorConfigs[spaceId + "-" + doc.id] = videoConfig;
    throw Error(" cannot get download url: " + JSON.stringify(videoConfig));
  }
  if (shouldSkip404(url)) return "skip 404";
  let videoSize = [NaN, NaN];
  if (url.startsWith("https://ipfs")) {
    videoSize = await probeWH(url, "video");
  } else {
    videoSize = await downloadAndGetWH(url, "video");
  }
  const [w] = videoSize.map((val) => val * pixelToSizeScale * scale);

  if (dryRun) {
    // console.log(`update one video to ${w} x ${h}`);
    return "success";
  } else
    return doc
      .update({
        "video.width": w,
      })
      .then(() => "success");
};
const processSpace = async (
  spaceId: string,
  target: "video" | "image",
  dryRun: boolean
) => {
  processing.add(spaceId + "-" + target);
  const batchSize = 10;
  let page = 0;
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  while (true) {
    const snapshot = await db
      .collection("spaces")
      .doc(spaceId)
      .collection("elementsTree")
      .where("elementType", "==", target)
      .limit(batchSize)
      .offset(batchSize * page)
      .get();

    const promises: Promise<Result>[] = [];
    snapshot.forEach((doc) => {
      if (target === "image")
        promises.push(processImage(doc.ref, spaceId, dryRun));
      else if (target === "video")
        promises.push(processVideo(doc.ref, spaceId, dryRun));
    });
    if (promises.length === 0) break;
    // @ts-ignore\
    const results = await Promise.allSettled(promises).then((results) => {
      const successed = results.filter(
        // @ts-ignore\
        (val) => val.status === "fulfilled" && val.value === "success"
      );
      const skipped = results.filter(
        // @ts-ignore\
        (val) => val.status === "fulfilled" && val.value.startsWith("skip")
      );
      // @ts-ignore\
      const rejected = results.filter((val) => val.status === "rejected");
      // console.log(successed);
      // @ts-ignore\
      rejected.forEach((record) => console.log(record));
      return [successed, skipped, rejected];
    });
    successCount += results[0].length;
    skippedCount += results[1].length;
    errorCount += results[2].length;
    page += 1;
    // console.log("processed: ", successCount + skippedCount + errorCount);
  }
  // console.log(`${spaceId} ${target} done `);
  processing.delete(spaceId + "-" + target);
  return [spaceId, target, successCount, skippedCount, errorCount];
};

// const targetSpaces = ["zz", "yang"];

const processAllSpaces = async (targetSpaces: string[], dryRun: boolean) => {
  const table: Array<string | number>[] = [];
  if (dryRun)
    table.push(["space", "type", "will migrate", "will skip", "will err"]);
  else table.push(["space", "type", "migrated", "skipped", "erred"]);

  const promises = [];
  for (const spaceId of targetSpaces) {
    if (spaceId === "hidden" || spaceId === "terrain") continue;
    promises.push(
      processSpace(spaceId, "image", dryRun),
      processSpace(spaceId, "video", dryRun)
    );
  }

  Promise.all(promises).then((results) => {
    const sums = results.reduce(
      //@ts-ignore
      ([aa, bb, cc, dd, ee], [a, b, c, d, e]) => [aa, bb, cc, dd + d, ee + e],
      [0, 0, 0, 0, 0]
    );

    table.push(...results);
    table.push(sums);
    console.log(errorConfigs);
    fs.writeFileSync("./migration_errors.json", JSON.stringify(errorConfigs));
    console.table(table);
  });
};

const getAllSpaceIds = async (): Promise<string[]> => {
  const spaces = await db
    .collection("spaces")
    .get()
    .then((res) => {
      return res.docs.map((doc) => doc.id);
    });

  // spaces.forEach((id) => console.log(id));
  return spaces;
};

if (require.main === module) {
  const dryRun = false;
  setInterval(() => {
    console.log(processing);
  }, 30000);
  getAllSpaceIds().then((ids) => {
    processAllSpaces(ids, dryRun);
  });
}
