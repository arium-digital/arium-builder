import puppeteer from "puppeteer";
import * as querystring from "querystring";
import * as functions from "firebase-functions";
import randomString from "random-string";
// import * as temp from "temp";
// import { bucket } from "./functions/media/fileUtils";

const randomPosition = (maxValue: number) =>
  Math.round(Math.random() * maxValue - maxValue / 2);

export const range = (quantity: number) => {
  const result: number[] = [];

  for (let i = 0; i < quantity; i++) {
    result.push(i);
  }

  return result;
};

const videos = [
  "https://assets.vlts.pw/testVideos/qvga/1.webm",
  "https://assets.vlts.pw/testVideos/qvga/6.webm",
  "https://assets.vlts.pw/testVideos/Arpeggiated.webm",
  "https://assets.vlts.pw/testVideos/Beats.webm",
  "https://assets.vlts.pw/testVideos/HangingWithJason.webm",
  "https://assets.vlts.pw/testVideos/Tutorial.webm",
  "https://assets.vlts.pw/testVideos/qvga/a1.webm",
  "https://assets.vlts.pw/testVideos/qvga/a3.webm",
];

const photos = [
  "https://assets.vlts.pw/profileImages/55GKStssn0VmExhpDFejPbSSA9j2/beq.png",
  "https://assets.vlts.pw/profileImages/ZJNTDo2qDeYwlXwgr3jYwpNL2R53/SD5.png",
  "https://assets.vlts.pw/profileImages/r78vhoXDIxesJnmZErOaS15cv2A2/kmY.png",
];

const videoOrRandom = (video?: string) => {
  if (video) return video;

  return videos[Math.floor(Math.random() * videos.length)];
};

const randomProfilePhoto = () => {
  return photos[Math.floor(Math.random() * photos.length)];
};

export interface OpenTestAgentArgs {
  url: string;
  video?: string;
  instanceId: string;
  x?: number;
  z?: number;
  randomPositionRadius?: number;
  randomTimeOffset?: number;
  lookAtX?: number;
  lookAtY?: number;
  lookAtZ?: number;
  duration?: number;
  motionProbability?: number;
}

const movementKeys: puppeteer.KeyInput[] = ["w", "a", "s", "d", "q", "e"];

export async function openExecuteTestAgent(
  {
    url = "https://dev.arium.xyz",
    video,
    instanceId = "itp-a",
    x,
    z,
    lookAtX,
    lookAtY,
    lookAtZ,
    randomPositionRadius = 40,
    randomTimeOffset = 1,
    duration = 5,
    motionProbability = 0.1,
  }: OpenTestAgentArgs,
  context?: functions.Response
) {
  const startingX = x ? x : randomPosition(randomPositionRadius);
  const startingZ = z ? z : randomPosition(randomPositionRadius);

  const startingLookAtX = lookAtX ? +lookAtX : 0;
  const startingLookAtY = lookAtY ? +lookAtY : 1.75;
  const startingLookAtZ = lookAtZ ? +lookAtZ : -100;

  const name = `agent-${randomString({ length: 4 })}`;

  const path = `spaces/${instanceId}/?auto-enter=true&test-agent=true&x=${startingX}&z=${startingZ}&lx=${startingLookAtX}&ly=${startingLookAtY}&lz=${startingLookAtZ}&dontRender=true&video=${querystring.escape(
    videoOrRandom(video)
  )}&name=${name}&profile-photo=${querystring.escape(randomProfilePhoto())}`;
  const urlToVisit = `${url}/${path}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  page.on("pageerror", (err: Error) => {
    console.error(err);
  });

  page.on("error", function (err) {
    console.error(err);
  });

  const timeOffset = Math.random() * randomTimeOffset;

  console.log(`visiting ${urlToVisit} after ${timeOffset} seconds`);

  return new Promise((resolve) => {
    setTimeout(async () => {
      await page.goto(urlToVisit);

      // const buttonSelector = "#initialize";

      // console.log("waiting for initialize");

      // // await page.waitForTimeout(2000);

      // // await page.waitForSelector(buttonSelector);

      // // await page.click(buttonSelector);
      // // try {
      // //   await page.click(buttonSelector);
      // // } catch (e) {
      // //   console.error(e);
      // // }

      // console.log("clicked initialize button. enter");
      let complete = false;

      let currentMovementKey: puppeteer.KeyInput | null;

      // const filePath = temp.path({
      //   suffix: ".png",
      // });

      // console.log({ filePath })

      await page.waitForTimeout(2000);

      // await page.screenshot({
      //   path: 'tmp.png',
      // });

      // const destination = `screenshots/${randomString({ length: 5 })}.png`;

      // console.log("uplaoding screenshot to", destination);
      // console.log(bucket);
      // await bucket().upload(filePath, {
      //   destination,
      //   predefinedAcl: "publicRead",
      // });

      console.log("entered space");

      let interval = setInterval(async () => {
        if (complete) return;
        if (currentMovementKey) {
          await page.keyboard.up(currentMovementKey);
        }
        const shouldMove = Math.random() < motionProbability;
        if (shouldMove) {
          currentMovementKey =
            movementKeys[Math.floor(Math.random() * movementKeys.length)];

          page.keyboard.down(currentMovementKey);
        } else {
          currentMovementKey = null;
        }
      }, 1000);

      console.log(`will close in ${duration} seconds.`);
      setTimeout(async () => {
        clearInterval(interval);
        complete = true;
        console.log("done. closing");
        await browser.close();
        resolve({
          url: urlToVisit,
        });
      }, duration * 1000);
    }, timeOffset * 1000);
  });
}

export interface MultiTesteAgentExecuteArgs {
  url: string;
  instanceId: string;
  numberInstances: number;
  duration: number;
}

export async function openMultiExecuteTesteAgent({
  url,
  instanceId,
  numberInstances,
}: MultiTesteAgentExecuteArgs) {
  console.log("url, instance id", url, instanceId);
  await Promise.all(
    range(numberInstances).map(() => {
      return openExecuteTestAgent({
        url,
        instanceId,
      });
    })
  );
}
