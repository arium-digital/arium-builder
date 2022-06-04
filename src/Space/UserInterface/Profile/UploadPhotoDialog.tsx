import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CloseIcon from "@material-ui/icons/Close";
import Button from "@material-ui/core/Button";
import clsx from "clsx";
import Grid from "@material-ui/core/Grid";
import styles from "Space/InSpaceEditor/styles.module.scss";
// import reactCropStyles from "../styles/react-crop.module.scss";
// import ReactCrop, { Crop} from "react-image-crop";
import { getCroppedImg, Area } from "../EntranceFlow/utils/canvasUtils";
import Cropper from "react-easy-crop";
import Slider from "@material-ui/core/Slider";
import Typography from "@material-ui/core/Typography";
import { ProfileImageActionButton } from "./ProfileImageCapture";
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      // width: '60%',
      // height: '60%'
    },
    modalPaper: {
      maxHeight: "90%",
      maxWidth: "90%",
      // height: '90%',
      position: "fixed",
      zIndex: 999,
      color: "black",
      backgroundColor: "white",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2),
      outline: "none", //https://github.com/mui-org/material-ui/issues/11504
    },
    fullWidth: {
      width: "90%",
      [theme.breakpoints.down("xs")]: {
        width: "100%",
        height: "100%",
      },
    },
    partialWidth: {
      width: "70%",
      [theme.breakpoints.down("xs")]: {
        width: "100%",
        height: "100%",
      },
    },
    closeButton: {
      position: "absolute",
      top: theme.spacing(2),
      right: theme.spacing(2),
      float: "right",
      pointerEvents: "stroke",
      padding: 0,
      minWidth: 0,
    },
    innerWrapper: {},
    cropContainer: {
      position: "relative",
      width: "100%",
      // height: 200,
      // background: '#333',
      height: 450,
      // [theme.breakpoints.up("sm")]: {
      //   height: 400,
      // },
    },
    cropButton: {
      flexShrink: 0,
      marginLeft: 16,
    },
    controls: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      [theme.breakpoints.up("sm")]: {
        flexDirection: "row",
        alignItems: "center",
      },
    },
    sliderContainer: {
      display: "flex",
      flex: "1",
      alignItems: "center",
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        width: "30%",
      },
    },
    sliderLabel: {
      [theme.breakpoints.down("xs")]: {
        minWidth: 65,
      },
    },
    slider: {
      padding: "22px 0px",
      marginLeft: 16,
      [theme.breakpoints.up("sm")]: {
        flexDirection: "row",
        alignItems: "center",
        margin: "0 16px",
      },
    },
    captureButton: {
      width: "100%",
      marginTop: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        width: "30%",
      },
    },
  })
);

const rotation = 0;

const UploadPhotoDialog = ({
  show,
  handleClose,
  handleImageSelected,
}: {
  show: boolean;
  handleClose: () => void;
  handleImageSelected: (image: string) => void;
}) => {
  const classes = useStyles();
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const reader = useMemo(() => new FileReader(), []);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  // const [rotation, setRotation] = useState<number>(0)
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    if (!imgSrc || !croppedAreaPixels || !canvasRef.current) return;
    try {
      const croppedImage = await getCroppedImg(
        canvasRef.current,
        imgSrc,
        croppedAreaPixels,
        rotation
      );
      handleImageSelected(croppedImage);
    } catch (e) {
      console.error(e);
    }
  }, [imgSrc, croppedAreaPixels, handleImageSelected]);

  useEffect(() => {
    const handleLoad = () => {
      setImgSrc(reader.result as string);
    };

    reader.addEventListener("load", handleLoad);

    return () => {
      reader.removeEventListener("load", handleLoad);
    };
  }, [reader]);

  const handleUseNewFileAsImage = useCallback(
    (files: File[]) => {
      const fileToUse = files[0];

      reader.readAsDataURL(fileToUse);
    },
    [reader]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/jpeg, image/png",
    onDrop: handleUseNewFileAsImage,
  });

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={show}
      onClose={handleClose}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={show}>
        <div
          className={clsx(
            classes.modalPaper,
            imgSrc ? classes.fullWidth : classes.partialWidth
          )}
        >
          <div className={classes.innerWrapper}>
            <Button className={classes.closeButton} onClick={handleClose}>
              <CloseIcon />
            </Button>
            <Grid container style={{ height: "100%", width: "90%" }}>
              {!imgSrc && (
                <Grid
                  item
                  style={{ height: "340px" }}
                  xs={12}
                  {...getRootProps({ className: clsx(styles.dragAndDrop) })}
                >
                  <input {...getInputProps()} />
                  <p>Upload a profile image</p>
                </Grid>
              )}
              {imgSrc && (
                <Grid item xs={12}>
                  {imgSrc && (
                    <>
                      <div className={classes.cropContainer}>
                        <Cropper
                          image={imgSrc}
                          crop={crop}
                          rotation={rotation}
                          zoom={zoom}
                          aspect={1}
                          onCropChange={setCrop}
                          // onRotationChange={setRotation}
                          onCropComplete={onCropComplete}
                          onZoomChange={setZoom}
                        />
                      </div>
                      <div className={classes.controls}>
                        <div className={classes.sliderContainer}>
                          <Typography
                            variant="overline"
                            classes={{ root: classes.sliderLabel }}
                          >
                            Zoom
                          </Typography>
                          <Slider
                            value={zoom}
                            min={1}
                            max={10}
                            step={0.1}
                            aria-labelledby="Zoom"
                            classes={{ root: classes.slider }}
                            onChange={(e, zoom) => setZoom(zoom as number)}
                          />
                        </div>
                        <div className={classes.captureButton}>
                          <ProfileImageActionButton
                            onClick={showCroppedImage}
                            text="Set Profile Image"
                            primary
                          />
                        </div>
                        {/* <Button
                          onClick={showCroppedImage}
                          variant="contained"
                          color="primary"
                          classes={{ root: classes.cropButton }}
                        >
                          Set Profile Image
                        </Button> */}
                      </div>
                      <canvas
                        ref={canvasRef}
                        width={320}
                        height={320}
                        style={{ display: "none" }}
                      />
                    </>
                  )}
                </Grid>
              )}
            </Grid>
          </div>
        </div>
      </Fade>
    </Modal>
  );
};

export default UploadPhotoDialog;
