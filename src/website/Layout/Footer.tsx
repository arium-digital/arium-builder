import { Grid, Hidden, IconButton, Typography } from "@material-ui/core";
import { Instagram, Twitter } from "@material-ui/icons";
import React from "react";
import { AriumLogo } from "../AriumLogo";
import { FaDiscord } from "react-icons/fa";
import styles from "css/eventLandingPage.module.scss";
export const FooterElementID = "Footer";
export const Footer = ({ lightTheme }: { lightTheme?: boolean }) => {
  return (
    <Grid container className={styles.footer} id={FooterElementID}>
      <hr />

      <Grid
        container
        item
        xs={12}
        md={3}
        className={styles.footerLogoContainer}
      >
        <AriumLogo dark={lightTheme} />
      </Grid>

      <Grid item xs={12} md={3}>
        <IconButton color="inherit" href="https://www.twitter.com/ariumspaces">
          <Twitter />
        </IconButton>
        <IconButton
          color="inherit"
          href="https://www.instagram.com/ariumspaces"
        >
          <Instagram />
        </IconButton>
        <IconButton color="inherit" href="https://discord.gg/k78RAaRJKa">
          <FaDiscord />
        </IconButton>
      </Grid>
      <Grid item xs={12} md={3} className={styles.resources}>
        <Typography variant="body2">
          {/* <a href="/terms">Terms of Service</a> <br />{" "}
          <a href="/privacy">Privacy Policy</a> <br /> */}
          &copy;2021 Arium Virtual Technologies Inc.
        </Typography>
      </Grid>
      <Hidden smDown>
        <Grid item xs={12} md={3}>
          <Typography variant="body2" className={styles.subtitle}>
            Contact us!
          </Typography>
          {/* <a href="mailto:info@arium.xyz">
            <Typography variant="body2">info@arium.xyz</Typography>
          </a> */}
        </Grid>
      </Hidden>
    </Grid>
  );
};
