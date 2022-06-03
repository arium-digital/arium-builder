export interface Size {
  width: number;
  height: number;
}
const computeVideoSize = ({
  videoSize,
  screenSize,
}: {
  videoSize: Size;
  screenSize: Size;
}): Size => {
  const videoAspect = videoSize.width / videoSize.height;
  const screenAspect = screenSize.width / screenSize.height;

  // if narrower than screen width, height is same and width scaled down
  if (videoAspect < screenAspect) {
    const height = screenSize.height;
    return {
      width: height * videoAspect,
      height,
    };
  } else {
    const width = screenSize.width;
    return {
      width,
      height: width / videoAspect,
    };
  }
};

export default computeVideoSize;
