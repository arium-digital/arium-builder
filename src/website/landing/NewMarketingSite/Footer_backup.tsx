import { Grid, Hidden, IconButton, Typography } from "@material-ui/core";
import { Instagram, Twitter } from "@material-ui/icons";
import React from "react";
import { AriumLogo } from "./AriumLogo";
import { FaDiscord } from "react-icons/fa";
import styles from "./styles.module.scss";

export const FooterElementID = "Footer";
export const Footer = () => {
  return (
    <Grid id={FooterElementID} container className={styles.footer}>
      <hr />
      <Grid item xs={12} sm={12} md={3}>
        <AriumLogo />
      </Grid>
      <Hidden smDown>
        <Grid item sm={3}>
          <Typography variant="body1" className={styles.subtitle}>
            Resources
          </Typography>
          <Typography variant="subtitle1">
            Terms of Service <br /> Privacy Policy
          </Typography>
        </Grid>
      </Hidden>
      <Grid item xs={12} sm={3}>
        <Hidden smDown>
          <Typography variant="body1" className={styles.subtitle}>
            Follow
          </Typography>
        </Hidden>

        <IconButton>
          <Twitter />
        </IconButton>
        <IconButton>
          <Instagram />
        </IconButton>
        <IconButton>
          <FaDiscord />
        </IconButton>
      </Grid>
      <Hidden smDown>
        <Grid item xs={12} sm={3}>
          <Typography variant="body1" className={styles.subtitle}>
            Contact us!
          </Typography>
          <a href="mailto:info@arium.xyz">
            <Typography variant="subtitle1">info@arium.xyz</Typography>
          </a>
        </Grid>
      </Hidden>
    </Grid>
  );
};
