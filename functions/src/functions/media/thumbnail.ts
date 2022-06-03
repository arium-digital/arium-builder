import * as functions from "firebase-functions";
import { bucket } from "./fileUtils";
import { spawn } from "child_process";
import https from "https";
import fs from "fs";
import * as temp from "temp";

const cacheInDays = 30;
const cacheInSeconds = cacheInDays * 24 * 60 * 60;

const allowedDomains: string[] = [
  "ipfs.io",
  "assets.vlts.pw",
  "ipfs.pixura.io",
  "res.cloudinary.com",
  "gateway.pinata.cloud",
  "visualmassage.mypinata.cloud",
  "img.rarible.com",
  "rarible.mypinata.cloud",
  "verticalcrypto.mypinata.cloud",
  "ipfsgateway.makersplace.com",
];

const allowedDomainHosts: string[] = ["pinata.cloud"];

const isInAllowedDomain = (domain: string) => allowedDomains.includes(domain);

const isInAllowedDomainHost = (domain: string) => {
  const allowedHost = allowedDomainHosts.find((host) => domain.includes(host));

  return !!allowedHost;
};

const assertIsValidUrl = (url: string) => {
  const parsedUrl = new URL(url);

  const domain = parsedUrl.hostname;

  if (isInAllowedDomain(domain) || isInAllowedDomainHost(domain)) {
    return;
  } else throw new Error(`domain ${domain} is not allowed`);
};

const getBucketUrl = (file: string) => {
  return bucket().file(file).publicUrl();
};

function shouldCopyToLocal(url: string): boolean {
  const parsedUrl = new URL(url);

  const domain = parsedUrl.hostname;

  // HACK - for some reason cannot pipe with rarible to thumbnail :(
  return domain.includes("mypinata.cloud");
}

async function localFileUrl(url: string) {
  const filePath = temp.path({
    suffix: ".mp4",
  });
  console.log("downloading", {
    url,
    filePath,
  });

  await download(url, filePath);

  return filePath;
}

function download(url: string, filePath: string) {
  return new Promise<void>((resolve) => {
    https.get(url, (res) => {
      // Image will be stored at this path
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        console.log("Download Completed");
        resolve();
      });
    });
  });
}

const getFileUrl = async ({
  file,
  url,
}: {
  file: string | undefined;
  url: string | undefined;
}): Promise<string> => {
  if (file) return getBucketUrl(file);

  if (!url) {
    throw new Error("url or file must be specified");
  }
  assertIsValidUrl(url);

  if (shouldCopyToLocal(url)) {
    return await localFileUrl(url);
  }

  return url;
};

function extractDecodedPath(assetPath: string) {
  const decoded = decodeURIComponent(assetPath);

  const parts = decoded.split("/");
  const fileName = parts[parts.length - 1];

  const encodedFileName = encodeURIComponent(fileName);

  return [...parts.slice(0, parts.length - 1), encodedFileName].join("/");
}

function getAssetPathFromPath(path: string) {
  const withoutThumbnail = path.replace("/thumbnail", "");
  const firstSlash = withoutThumbnail.indexOf("/");
  if (firstSlash < 0) return undefined;

  return withoutThumbnail.slice(firstSlash + 1);
}

const thumbnail = functions
  .runWith({
    memory: "512MB",
  })
  .https.onRequest(async (req, res) => {
    // console.log(req);
    const assetPathFromQuery = req.query.file as string | undefined;
    const url = req.query.url as string | undefined;
    const width = +((req.query.w as string) || "400");
    const quality = +((req.query.q as string) || "90");
    const time = +((req.query.t as string) || "0");

    const qualityValue = scaleQuality(quality);

    const assetPathFromPath = getAssetPathFromPath(req.path);

    const assetPath = assetPathFromPath || assetPathFromQuery;

    const decodedAssetPath = assetPath
      ? extractDecodedPath(assetPath)
      : undefined;

    const fileLocation = await getFileUrl({ file: decodedAssetPath, url });

    console.log({ fileLocation, decodedAssetPath });

    // console.log({
    //   query: req.query,
    //   qualityValue,
    //   fileLocation,
    //   scale: width,
    //   quality,
    //   time,
    // });

    res.set(
      "Cache-Control",
      `public, max-age=${cacheInSeconds}, s-maxage=${cacheInSeconds}`
    );
    res.type("jpeg");

    const timeArgs: string[] = time > 0 ? ["-ss", time.toString()] : [];

    const ffmpeg = spawn("ffmpeg", [
      ...timeArgs,
      "-i",
      fileLocation,
      "-vframes",
      "1",
      "-filter:v",
      `scale=${width}:-1`,
      "-qscale:v",
      qualityValue.toString(),
      "-f",
      "singlejpeg",
      "pipe:1",
    ]);

    // redirect transcoded ip-cam stream to http response
    ffmpeg.stdout.pipe(res, { end: true });

    // error logging
    ffmpeg.stderr.setEncoding("utf8");
    ffmpeg.stderr.on("data", (data) => {
      console.log(data);
    });
  });

export default thumbnail;

const maxQuality = 1;
const minQuality = 32;

function scaleQuality(quality: number) {
  const qualityPercentage = quality / 100;

  const range = minQuality - maxQuality;

  return Math.floor(1 + (1 - qualityPercentage) * range);
}
