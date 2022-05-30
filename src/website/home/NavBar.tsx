import { handleLogout } from "website/header";
import {
  AppBar,
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
import { FooterElementID } from "components/EventRoute/Footer";
import { AuthState, useAuthentication } from "hooks/auth/useAuthentication";
import React, { MouseEventHandler, useCallback, useState } from "react";
import { UserInfo } from "website/header";
import { AriumLogo } from "./AriumLogo";
import { AriumCloseIcon, AriumMenuIcon } from "./Icons";
import styles from "./styles.module.scss";
import { DivGrow } from "./utils";
import { ariumBlack } from "css/styleVariables";
import { FaDiscord } from "react-icons/fa";
// import { ActNaturalElementID } from "./ActNatural";

type BtnProps = Pick<ButtonProps, "onClick" | "className" | "color"> & {
  label: React.ReactNode;
};

const buttons: BtnProps[] = [
  // {
  //   label: "Solutions",
  //   onClick: () => callScrollIntoView(ActNaturalElementID),
  // },
  { label: "Contact", onClick: () => callScrollIntoView(FooterElementID) },
];

const callScrollIntoView = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) element.scrollIntoView();
};
export const LoginButton = ({
  spaceId,
  authState,
}: {
  spaceId?: string;
  authState: AuthState;
}) => {
  const { authenticated, isAnonymous, user } = authState;
  const loginPath =
    window.location.pathname === "/" ? "/my-spaces" : window.location.pathname;
  return (
    <>
      {!authenticated || isAnonymous ? (
        <Button
          className={styles.navBtn}
          href={`/account/login?redirect=${loginPath}`}
        >
          <Typography variant="body1">Login</Typography>
        </Button>
      ) : (
        <>
          {user && <UserInfo user={user} />}
          <Button className={styles.logoutBtn} onClick={handleLogout}>
            <Typography variant="body1">Logout</Typography>
          </Button>
        </>
      )}
    </>
  );
};

const BtnDesktop = ({ label, ...rest }: BtnProps) => (
  <Grid item>
    <Button {...rest}>
      <Typography variant="body1">{label}</Typography>
    </Button>
  </Grid>
);

const LinkDesktop = ({
  label,
  href,
  className,
}: {
  label: string;
  href: string;
  className?: string;
}) => (
  <Grid item>
    <a href={href} className={className}>
      {label}
    </a>
  </Grid>
);

const BtnMobile = ({ label, ...rest }: BtnProps) => (
  <Grid item>
    <Button {...rest}>{label}</Button>
  </Grid>
);

const DeskTopNav = ({ authState }: { authState: AuthState }) => {
  const isLoggedIn = authState.authenticated && !authState.isAnonymous;
  return (
    <>
      {!isLoggedIn && (
        <>
          <a
            className={styles.navBtn}
            style={{ color: ariumBlack, position: "relative", top: 4 }}
            href="https://discord.gg/k78RAaRJKa"
            target={"_blank"}
            rel="noreferrer"
            title="Join our Discord"
          >
            Discord
            <IconButton style={{ position: "relative", top: -1 }}>
              <FaDiscord />
            </IconButton>
          </a>
        </>
      )}
      {buttons.map((props, i) => (
        <BtnDesktop key={i} className={styles.navBtn} {...props} />
      ))}
      {isLoggedIn && (
        <LinkDesktop
          key="my-spaces"
          className={styles.navBtn}
          label="Your Spaces"
          href="/my-spaces"
        />
      )}
      <LoginButton authState={authState} />
    </>
  );
};

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
          {buttons.map(({ onClick, ...rest }, i) => (
            <BtnMobile
              key={i}
              className={styles.mobileNavBtn}
              {...rest}
              onClick={excuteAndCloseNav(onClick)}
            />
          ))}
        </Grid>
      </Drawer>
    </>
  );
};

export const NavBar = () => {
  const trigger = useScrollTrigger();
  const authState = useAuthentication({ ensureSignedInAnonymously: false });
  return (
    <>
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar elevation={0} color="inherit" className={styles.appBar}>
          <Toolbar disableGutters className={styles.toolBar}>
            <AriumLogo />
            <DivGrow />
            <Hidden smDown>
              <DeskTopNav authState={authState} />
            </Hidden>
            <Hidden mdUp>
              <MobileNav />
            </Hidden>
          </Toolbar>
        </AppBar>
      </Slide>
    </>
  );
};
