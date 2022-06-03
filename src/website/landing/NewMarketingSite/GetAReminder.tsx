import { Grid, Typography } from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import { EmailSignUp } from "./EmailSignUpForm";
import styles from "./styles.module.scss";
import { OptionalOnClick } from "./types";
import { DivGrow } from "./utils";

export const GetAReminder = ({ onClick }: OptionalOnClick) => {
  return (
    <Grid
      className={clsx(styles.gridContainer, styles.getAReminder)}
      container
      justify="center"
      alignItems="flex-start"
    >
      <DivGrow />
      <Grid item xs={12} md={5}>
        <Typography gutterBottom variant="h1" color="inherit">
          Get a reminder about upcoming events
        </Typography>
      </Grid>
      <DivGrow />
      <Grid item xs={12} md={5} className={styles.emailSignUp}>
        <EmailSignUp />
      </Grid>
      <DivGrow />
    </Grid>
  );
};
