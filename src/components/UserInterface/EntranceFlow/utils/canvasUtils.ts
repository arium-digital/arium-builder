const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

// function getRadianAngle(degreeValue: number) {
//   return (degreeValue * Math.PI) / 180
// }

export interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {File} image - Image File url
 * @param {Object} pixelCrop - pixelCrop Object provided by react-easy-crop
 * @param {number} rotation - optional rotation parameter
 */
export async function getCroppedImg(
  canvas: HTMLCanvasElement,
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
) {
  const image = await createImage(imageSrc);
  // const canvas = document.createElement('canvas')
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  // const maxSize = Math.max(image.width, image.height)
  // const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  // set each dimensions to double largest dimension to allow for a safe area for the
  // image to rotate in without being clipped by canvas context
  canvas.width = 320;
  canvas.height = 320;

  // translate canvas context to a central location on image to allow rotating around the center.
  // ctx.translate(safeArea / 2, safeArea / 2)
  // ctx.rotate(getRadianAngle(rotation))
  // ctx.translate(-safeArea / 2, -safeArea / 2)
  const sx = pixelCrop.x;
  const sy = pixelCrop.y;
  const sWidth = pixelCrop.width;
  const sHeight = pixelCrop.height;
  const dx = 0;
  const dy = 0;
  const dWidth = 320;
  const dHeight = 320;

  // draw rotated image and store data.
  ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  // const data = ctx.getImageData(0, 0, safeArea, safeArea)

  // set canvas width to final desired crop size - this will clear existing context
  // canvas.width = pixelCrop.width
  // canvas.height = pixelCrop.height

  // paste generated rotate image with correct offsets for x,y crop values.
  // ctx.putImageData(
  //   data,
  //   Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
  //   Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  // )

  // As Base64 string
  // return canvas.toDataURL('image/jpeg');

  const asImage = canvas.toDataURL("image/png");

  // As a blob
  return asImage;
}

export async function getRotatedImage(imageSrc: string, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const orientationChanged =
    rotation === 90 ||
    rotation === -90 ||
    rotation === 270 ||
    rotation === -270;
  if (orientationChanged) {
    canvas.width = image.height;
    canvas.height = image.width;
  } else {
    canvas.width = image.width;
    canvas.height = image.height;
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  return new Promise<string>((resolve) => {
    canvas.toBlob((file) => {
      if (file) resolve(URL.createObjectURL(file));
    }, "image/png");
  });
}
