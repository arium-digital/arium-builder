import { Button, Grid, Typography } from "@material-ui/core";
import styles from "./styles.module.scss";
import { IconBetaSignUp, Centered, getImgSrcAndSet } from "./utils";
import React from "react";
import { DivGrow } from "./utils";
import { OptionalOnClick } from "./types";
import clsx from "clsx";
const { imgSrc, imgSrcSet } = getImgSrcAndSet("marble-theater");
export const ArtInContext = ({ onClick }: OptionalOnClick) => {
  return (
    <Grid
      className={clsx(styles.gridContainer, styles.artInContext)}
      container
      justify="center"
      alignItems="center"
    >
      <DivGrow />
      <Grid item xs={12} md={4}>
        <Typography paragraph variant="h1">
          Bring Story and Context to Art
        </Typography>
        <Typography paragraph variant="body1">
          Break free from traditional constraints and build an{" "}
          <strong>exhibition worth remembering</strong>. Every aspect of your
          space - from the sky to the ground to the buildings themselves - is
          yours to set. Present your art in a space as vibrant and unique as the
          work itself.
        </Typography>
        {onClick && (
          <Button size="large" onClick={onClick}>
            <IconBetaSignUp />
            Sign up for our Beta
          </Button>
        )}
      </Grid>
      <DivGrow />
      <Grid item xs={12} md={6}>
        <div className={styles.section2}>
          <div className={styles.orangeBg} />
          <div className={styles.media}>
            <Centered>
              <img src={imgSrc} srcSet={imgSrcSet} alt="a beautiful model" />
            </Centered>
          </div>
        </div>
      </Grid>
    </Grid>
  );
};
