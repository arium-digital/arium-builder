import {
  AppBar,
  Box,
  Button,
  ButtonProps,
  Drawer,
  Grid,
  Hidden,
  IconButton,
  Slide,
  Toolbar,
  Typography,
  useScrollTrigger,
} from "@material-ui/core";
import React, { MouseEventHandler, useCallback, useState } from "react";
import styles from "css/eventLandingPage.module.scss";
import { AriumCloseIcon, AriumMenuIcon } from "Space/svgIcons";
import { AriumLogo } from "website/AriumLogo";
import { useAuthentication } from "hooks/auth/useAuthentication";
import { LoginStatus } from "website/header";
import { OptionalSpaceId } from "Space/InSpaceEditor/types";
type BtnProps = Pick<ButtonProps, "onClick" | "className" | "href"> & {
  label: React.ReactNode;
};

const buttons: BtnProps[] = [
  // {
  //   label: "Solutions",
  //   onClick: () => {
  //     console.error("not implemented");
  //   },
  // },
  // {
  //   label: "Events",
  //   onClick: () => {
  //     console.error("not implemented");
  //   },
  // },
  // {
  //   label: "Contact us",
  //   onClick: () => {
  //     console.error("not implemented");
  //   },
  // },
];

const BtnDesktop = ({ label, ...rest }: BtnProps) => (
  <Grid item>
    <Button {...rest}>
      <Typography variant="body1">{label}</Typography>
    </Button>
  </Grid>
);

const BtnMobile = ({ label, ...rest }: BtnProps) => (
  <Grid item>
    <Button {...rest}>{label}</Button>
  </Grid>
);

const DeskTopNav = ({ spaceId }: { spaceId?: string }) => {
  const { authenticated, isAnonymous, user } = useAuthentication({
    ensureSignedInAnonymously: false,
  });
  return (
    <>
      {buttons.map((props, i) => (
        <BtnDesktop key={i} className={styles.navBtn} {...props} />
      ))}

      {(!authenticated || isAnonymous) && (
        <Grid item>
          <Button
            className={styles.navBtn}
            href={`/account/login?redirect=${window.location.pathname}`}
          >
            <Typography variant="body1">Login</Typography>
          </Button>
        </Grid>
      )}
      <LoginStatus
        classNameOverride={styles.navBtn}
        authenticated={authenticated}
        isAnonymous={isAnonymous}
        user={user}
        spaceId={spaceId}
      />
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const excuteAndCloseNav = useCallback((func?: MouseEventHandler) => {
    return (e: any) => {
      setOpen(false);
      setTimeout(() => {
        func && func(e);
      }, 500);
    };
  }, []);
  return (
    <>
      <Button onClick={() => setOpen((curr) => !curr)}>
        <AriumMenuIcon />
      </Button>
      <Drawer
        hideBackdrop
        anchor="right"
        open={open}
        PaperProps={{
          className: styles.mobileNavPaper,
        }}
        onClose={() => setOpen(false)}
        className={[styles.gridContainer, styles.mobileNavContainer].join(" ")}
      >
        <Grid
          container
          justify="center"
          alignItems="center"
          direction="column"
          className={[styles.gridContainer].join(" ")}
        >
          <IconButton
            className={styles.closeButton}
            onClick={() => setOpen(false)}
          >
            <AriumCloseIcon color="white" />
          </IconButton>
          {buttons.map(({ onClick, ...rest }, i) =>
            i === buttons.length - 1 ? null : (
              <BtnMobile
                key={i}
                className={styles.mobileNavBtn}
                {...rest}
                onClick={excuteAndCloseNav(onClick)}
              />
            )
          )}
        </Grid>
      </Drawer>
    </>
  );
};

export const NavBar = ({ spaceId }: OptionalSpaceId) => {
  const trigger = useScrollTrigger();
  return (
    <>
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar elevation={0} color="inherit" className={styles.appBar}>
          <Toolbar className={styles.toolBar}>
            <AriumLogo dark />
            <Box flexGrow={1} />
            <Hidden smDown>
              <DeskTopNav spaceId={spaceId} />
            </Hidden>
            {/* <Hidden mdUp>
              <MobileNav />
            </Hidden> */}
          </Toolbar>
        </AppBar>
      </Slide>
    </>
  );
};
