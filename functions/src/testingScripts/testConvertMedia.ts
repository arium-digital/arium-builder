import { bucket } from "../functions/media/fileUtils";
import { StoredFileLocation } from "../../../shared/sharedTypes";
import { convertVideo } from "../functions/media/convertMedia";

process.env.GOOGLE_APPLICATION_CREDENTIALS = "../serviceAccount.json";

const maxVideoSize = 1280;
const maxImageSize = 400;

const spaceId = "institut-2";
export const convertInvidiualVideo = async (fileName: string) => {
  const videoDestination: StoredFileLocation = {
    fileLocation: "spaceAssets",
    fileType: "stored",
    fileName: `${fileName}-${maxVideoSize}.mp4`,
    spaceId,
  };

  const imageDestination: StoredFileLocation = {
    fileLocation: "spaceAssets",
    fileType: "stored",
    fileName: `${fileName}-${maxImageSize}.jpg`,
    spaceId,
  };
  const result = await convertVideo({
    fileLocation: {
      fileType: "stored",
      fileLocation: "spaceAssets",
      spaceId,
      // @ts-ignore
      fileName: `${fileName.replaceAll(" ", "%20")}.mp4`,
    },
    // fileLocation: {
    //   fileType: "external",
    //   url:
    //     "https://ipfs.pixura.io/ipfs/QmWWFYW77YJYuFGsFtmhgq5metkQDuStFschcNtShzGN6o/animeta-1.mp4",
    // },
    maxVideoSize,
    maxImageSize,
    destinationVideoFile: videoDestination,
    destinationImageFile: imageDestination,
  });

  console.log(result);
};

const main = async () => {
  const files = await bucket().getFiles({
    prefix: `spaceAssets/${spaceId}`,
  });

  const fileNames = files[0].map((fileEnry) => {
    const fileName = fileEnry.name;

    const parts = fileName.split("/");

    return parts[parts.length - 1];
  });

  const videoFileNames = fileNames.filter((fileName) =>
    fileName.endsWith("mp4")
  );

  const withoutExtension = videoFileNames.map((fileName) => {
    const split = fileName.split(".");
    return split[0];
  });

  console.log(withoutExtension);

  for (let videoFile of withoutExtension) {
    console.log("converting", videoFile);
    await convertInvidiualVideo(videoFile);
  }

  // await convertInvidiualVideo('10_1TheAncestor;superstar-v2')
};

main();
