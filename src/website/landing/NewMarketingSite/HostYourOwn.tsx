import { Button, Grid, Typography } from "@material-ui/core";
import styles from "./styles.module.scss";
import { IconBetaSignUp, getImgSrcAndSet, useIsSmallScreen } from "./utils";
import React from "react";
import { DivGrow } from "./utils";
import { AriumOrange, AriumWhite } from "../../themes/lightTheme";
import { OptionalOnClick } from "./types";
import clsx from "clsx";

const { imgSrc, imgSrcSet } = getImgSrcAndSet("weAreReady");

export const HostYourOwn = ({ onClick }: OptionalOnClick) => {
  const smallScreen = useIsSmallScreen();
  return (
    <Grid
      className={clsx(styles.gridContainer, styles.hostYourOwn)}
      container
      justify="center"
      alignItems="center"
    >
      <Grid item xs={12} md={6}>
        <div className={styles.media}>
          <img
            src={imgSrc}
            srcSet={imgSrcSet}
            alt="screenshot of an Arium event"
          />
        </div>
      </Grid>
      <DivGrow />
      <Grid item xs={12} md={4}>
        <Typography
          gutterBottom
          variant="h1"
          color={smallScreen ? "primary" : "inherit"}
        >
          We are ready, the rest is up to you.
        </Typography>
        {onClick && (
          <Button
            size="large"
            onClick={onClick}
            color={smallScreen ? "primary" : "inherit"}
          >
            <IconBetaSignUp color={smallScreen ? AriumOrange : AriumWhite} />
            Host your own event
          </Button>
        )}
      </Grid>
      <DivGrow />
    </Grid>
  );
};
