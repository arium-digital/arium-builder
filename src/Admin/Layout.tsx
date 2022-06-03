import CssBaseline from "@material-ui/core/CssBaseline";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import { useEffect, useMemo, useState } from "react";
import { useAuthentication } from "../hooks/auth/useAuthentication";
import { theme } from "../shared/theme";
import Login from "../shared/components/Login";
import { useStyles } from "../shared/styles";
import TopNav from "./components/TopNav";
import SideNav from "./components/SideNav";
import { useRouter } from "next/router";
import Alert from "@material-ui/lab/Alert";
import { LogoutLink } from "../shared/components/LogoutButton";

const Main = ({
  children,
  section,
}: {
  children: React.ReactChild;
  section: string;
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TopNav />
      <SideNav section={section} />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {children}
      </main>
    </div>
  );
};

export const EnsureAuth = ({ children }: { children: React.ReactChild }) => {
  const { authenticated, isAnonymous, isAdmin } = useAuthentication({
    ensureSignedInAnonymously: false,
    forceRefreshToken: true,
  });
  const router = useRouter();

  useEffect(() => {
    document.title = "Arium Admin";
  }, []);

  const requiresLogin = useMemo(() => !authenticated || isAnonymous, [
    authenticated,
    isAnonymous,
  ]);

  const [accessState, setAccessState] = useState<
    "authenticating" | "authorized" | "unauthorized"
  >("authenticating");

  useEffect(() => {
    if (!authenticated) return;

    if (!isAdmin) {
      setAccessState("unauthorized");
      return;
    }

    setAccessState("authorized");
    return;
  }, [isAdmin, authenticated, router]);

  if (accessState === "unauthorized")
    return (
      <Alert severity="error">
        Unauthorized. Please <LogoutLink to="/admin" /> and login if you have
        reached this in error.
      </Alert>
    );

  return (
    <ThemeProvider theme={theme}>
      <>
        <CssBaseline />
        {requiresLogin && <Login title="Arium Admin" />}
        {!requiresLogin && children}
      </>
    </ThemeProvider>
  );
};

const Layout = ({
  children,
  section,
}: {
  children: React.ReactChild;
  section: string;
}) => {
  return (
    <EnsureAuth>
      <Main section={section}>{children}</Main>
    </EnsureAuth>
  );
};

export default Layout;
