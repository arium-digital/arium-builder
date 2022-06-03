import { Button, Grid, Typography } from "@material-ui/core";
import styles from "./styles.module.scss";
import { IconBetaSignUp, getImgSrcAndSet, useIsSmallScreen } from "./utils";
import React from "react";
import { DivGrow } from "./utils";
import { OptionalOnClick } from "./types";
import clsx from "clsx";

const { imgSrc, imgSrcSet } = getImgSrcAndSet("asItWasMeantToBeSeen");
export const AsItWasMeantToBeSeen = ({ onClick }: OptionalOnClick) => {
  const isSmallScreen = useIsSmallScreen();
  return (
    <div className={clsx(styles.gridContainer, styles.asItWasMeantToBeSeen)}>
      <Grid
        className={styles.grid}
        container
        justify="center"
        alignItems="center"
      >
        <DivGrow />
        <Grid item xs={12} md={6} className={styles.section1}>
          <div className={styles.bg} />
          <img src={imgSrc} srcSet={imgSrcSet} alt="a 3d model on a lion" />
        </Grid>
        <Grid item xs={12} md={4} className={styles.section2}>
          <Typography gutterBottom variant="h1">
            As it was meant to be seen
          </Typography>
          <Typography paragraph variant="body1">
            You care about quality. So do we. Upload your files or load your
            NFTs and enjoy
            <strong> photos, videos and 3D models</strong> as they were meant to
            be experienced, displayed in high quality in a beautiful space that
            brings out the best in the artwork.
          </Typography>
          {onClick && (
            <Button size="large" onClick={onClick}>
              <IconBetaSignUp color={isSmallScreen ? undefined : "#ffffff"} />
              Sign up for our Beta
            </Button>
          )}
        </Grid>
        <DivGrow />
      </Grid>
    </div>
  );
};
