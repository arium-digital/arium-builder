import { Button, Grid, Typography } from "@material-ui/core";
import React from "react";
import styles from "./styles.module.scss";
import { OptionalOnClick } from "./types";
import { IconBetaSignUp, DivGrow, getImgSrcAndSet } from "./utils";
const { imgSrc, imgSrcSet } = getImgSrcAndSet("actNatural");
export const ActNaturalElementID = "ActNatural";
export const ActNatural = ({ onClick }: OptionalOnClick) => {
  return (
    <>
      <Grid
        id={ActNaturalElementID}
        className={[styles.gridContainer, styles.actNatural].join(" ")}
        container
        justify="center"
        alignItems="center"
      >
        <Grid item xs={12} md={6}>
          <div className={styles.section1}>
            <img src={imgSrc} srcSet={imgSrcSet} alt="screenshot of a event" />
          </div>
        </Grid>
        <DivGrow />
        <Grid item xs={12} md={3}>
          <Typography variant="h1">
            Feel like You're in the Same Room Together
          </Typography>
          <Typography variant="body1" paragraph>
            Meet friends or strangers and explore the world of Arium together.
            3D virtual space and positional audio foster a serendipitous,
            organic social experience. If you want to talk to someone in Arium,
            simply walk over to them - making even the largest virtual events
            feel fun and natural. Experience art together and connect with your
            community - no matter where you are in the world.
          </Typography>
          {onClick && (
            <Button size="large" onClick={onClick}>
              <IconBetaSignUp />
              Sign up for our Beta
            </Button>
          )}
        </Grid>
        <DivGrow />
        <DivGrow />
      </Grid>
    </>
  );
};
