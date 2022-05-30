import {
  AppBar,
  Button,
  Container,
  CssBaseline,
  Slide,
  ThemeProvider,
  Toolbar,
  Typography,
  useScrollTrigger,
} from "@material-ui/core";
import React from "react";
import { AriumLogo } from "website/home/AriumLogo";
import { LoginButton } from "website/home/NavBar";
import { lightTheme } from "website/themes/lightTheme";
import { DivGrow } from "website/home/utils";
import styles from "./styles.module.scss";
import { Footer } from "components/EventRoute/Footer";
import { useAuthentication } from "hooks/auth/useAuthentication";
type NavItemKey = "documentation" | "my-spaces";

export type NavProps = { navItems?: NavItemKey[] };

const navItemMappings: Record<NavItemKey, React.ReactNode> = {
  documentation: (
    <Button target="_blank" href="https://docs.arium.xyz/space_setup/">
      <Typography variant="body1">Documentation</Typography>
    </Button>
  ),
  "my-spaces": (
    <Button target="_blank" href="/my-spaces">
      <Typography variant="body1">Your Spaces</Typography>
    </Button>
  ),
};

const DefaultNav = ({ navItems = [] }: NavProps) => {
  const trigger = useScrollTrigger();
  const authState = useAuthentication({ ensureSignedInAnonymously: false });
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <AppBar elevation={0} color="inherit" className={styles.appBar}>
        <Toolbar disableGutters className={styles.toolBar}>
          <AriumLogo />
          <DivGrow />
          {navItems.map((key) => navItemMappings[key])}
          <LoginButton authState={authState} />
        </Toolbar>
      </AppBar>
    </Slide>
  );
};

const DefaultFooter = () => {
  return (
    <Container maxWidth="lg" disableGutters className={styles.footerContainer}>
      <br />
      <br />
      <br />
      <br />
      <Footer lightTheme />
      <br />
      <br />
      <br />
    </Container>
  );
};

/*
Layout2 includes the new design style 
and the new header and footer
(as same as the current marketing site)

**/
export const Layout2 = ({
  children,
  navOverride,
  footerOverride,
  disableFooter,
  disableNav,
  navProps = {},
}: {
  disableNav?: boolean;
  navProps?: NavProps;
  disableFooter?: boolean;
  children: React.ReactNode;
  navOverride?: React.ReactNode;
  footerOverride?: React.ReactNode;
}) => {
  return (
    <>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Container maxWidth="lg">
          {disableNav ? null : navOverride ? (
            <> {navOverride}</>
          ) : (
            <DefaultNav {...navProps} />
          )}
          <main className={styles.layout2MainContainer}>{children}</main>
          {disableFooter ? null : footerOverride ? (
            <> {footerOverride}</>
          ) : (
            <DefaultFooter />
          )}
        </Container>
      </ThemeProvider>
    </>
  );
};
