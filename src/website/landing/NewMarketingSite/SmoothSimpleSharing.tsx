import { Button, Grid, Typography } from "@material-ui/core";
import React from "react";
import styles from "./styles.module.scss";
import { OptionalOnClick } from "./types";
import { IconBetaSignUp, DivGrow, getImgSrcAndSet } from "./utils";
export const SmoothSimpleSharingElementID = "SmoothSimpleSharing";
const { imgSrc, imgSrcSet } = getImgSrcAndSet("smoothSimpleSharing");
export const SmoothSimpleSharing = ({ onClick }: OptionalOnClick) => {
  return (
    <Grid
      id={SmoothSimpleSharingElementID}
      className={[styles.gridContainer, styles.smoothSimpleSharing].join(" ")}
      container
      justify="center"
      alignItems="center"
    >
      <DivGrow />
      <Grid item xs={12} md={4}>
        <Typography gutterBottom variant="h1">
          Create a Vibrant, Engaging Live Experience
        </Typography>
        <Typography paragraph variant="body1">
          Hosting a panel discussion or artist talk? Streaming a dj, vj, or live
          performance? With Arium you can Broadcast to your guests with multiple
          sharing options. Integrate seamlessly with the external media tools
          you already use – live stream into Arium from Zoom, OBS, Streamlabs or
          more.
        </Typography>
        {onClick && (
          <Button size="large" onClick={onClick}>
            <IconBetaSignUp />
            Sign up for our Beta
          </Button>
        )}
      </Grid>
      <DivGrow />
      <Grid item xs={12} md={5} className={styles.media}>
        <img
          src={imgSrc}
          srcSet={imgSrcSet}
          alt="people watch a big screen together"
        />
      </Grid>
      <DivGrow />
    </Grid>
  );
};
