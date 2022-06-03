import { decodeRGBE, HDRImageData } from "@derschmale/io-rgbe";
import { Card, CardActionArea } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { SyntheticEvent, useCallback } from "react";
import { useEffect, useRef } from "react";
import { useFileDownloadUrl } from "../../../fileUtils";
import { FileLocation } from "../../../spaceTypes";
import { useStyles } from "../../styles";

//from https://github.com/DerSchmale/io-rgbe/blob/main/examples/read/script.js
const updateImage = (canvas: HTMLCanvasElement, hdri: HDRImageData) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const data = hdri.data;
  const tgt = new Uint8ClampedArray((data.length / 3) * 4);
  const gamma = 1.0 / 2.2;
  const exposure = hdri.exposure;

  for (let i = 0, j = 0; i < data.length; i += 3) {
    tgt[j] = Math.pow(data[i] * exposure, gamma) * 0xff;
    tgt[j + 1] = Math.pow(data[i + 1] * exposure, gamma) * 0xff;
    tgt[j + 2] = Math.pow(data[i + 2] * exposure, gamma) * 0xff;
    tgt[j + 3] = 0xff;
    j += 4;
  }

  const imgData = new ImageData(tgt, hdri.width, hdri.height);
  canvas.width = hdri.width;
  canvas.height = hdri.height;
  ctx.clearRect(0, 0, hdri.width, hdri.height);
  ctx.putImageData(imgData, 0, 0);
};

const RenderRGBE = ({ src }: { src: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const abortControler = new AbortController();
    fetch(src)
      .then((res) => res.arrayBuffer())
      .then((buffer) => decodeRGBE(new DataView(buffer)))
      .then((imageData) => {
        if (!canvasRef.current) return;
        updateImage(canvasRef.current, imageData);
      });
    return () => {
      abortControler.abort();
    };
  }, [src]);
  return <canvas ref={canvasRef} style={{ width: "100%" }} />;
};
const ImagePreview = ({
  file,
  onClick,
  shapeDetermined,
  isRGBE,
}: {
  file: FileLocation;
  onClick?: any;
  isRGBE?: boolean;
  shapeDetermined?: (shape: { width: number; height: number }) => void;
}) => {
  const fileUrl = useFileDownloadUrl(file, true);

  const classes = useStyles();

  const handleLoadedMedata = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      if (!shapeDetermined) return;
      const imageWidth = (e.target as HTMLImageElement).naturalWidth;
      const imageHeight = (e.target as HTMLImageElement).naturalHeight;
      shapeDetermined({ width: imageWidth, height: imageHeight });
    },
    [shapeDetermined]
  );

  if (!fileUrl) return <Skeleton height="160px" />;

  return (
    <Card elevation={0}>
      <CardActionArea onClick={onClick}>
        {isRGBE ? (
          <RenderRGBE src={fileUrl} />
        ) : (
          <img
            src={fileUrl}
            alt="Preview"
            className={classes.previewImage}
            onLoad={handleLoadedMedata}
          />
        )}
      </CardActionArea>
    </Card>
  );
};

export default ImagePreview;
