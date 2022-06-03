import CssBaseline from "@material-ui/core/CssBaseline";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import { useEffect, useMemo } from "react";
import { AuthState, useAuthentication } from "../hooks/auth/useAuthentication";
import { theme } from "../shared/theme";
import Login from "../shared/components/Login";
import { useStyles } from "./styles";
import TopNav from "./components/TopNav";
import SideNav from "./components/SideNav";
import { useRouter } from "next/router";
import {
  SpaceAccess,
  SpaceAccessContext,
  useSpaceAccess,
} from "hooks/auth/useSpaceAccess";

const Main = ({
  children,
  spaceId,
  spaceSlug,
  section,
  authState,
  spaceAccess,
}: {
  children: React.ReactChild;
  spaceId: string;
  spaceSlug: string;
  section: string;
  authState: AuthState;
  spaceAccess: SpaceAccess;
}) => {
  const { canEdit, pending, editableSpaces } = spaceAccess;

  const router = useRouter();

  useEffect(() => {
    if (pending) return;
    if (!canEdit) {
      if (editableSpaces?.length === 0) {
        router.push("/", undefined, {
          shallow: false,
        });
      } else {
        router.push("/editor", undefined, {
          shallow: false,
        });
      }
    }
  }, [canEdit, editableSpaces?.length, pending, router]);

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TopNav
        editableSpaces={editableSpaces}
        spaceSlug={spaceSlug}
        section={section}
      />
      <SideNav section={section} spaceSlug={spaceSlug} />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {canEdit && children}
      </main>
    </div>
  );
};

export const EnsureAuth = ({
  children,
  authState: { authenticated, isAnonymous },
}: {
  children: React.ReactChild;
  authState: AuthState;
}) => {
  const requiresLogin = useMemo(() => !authenticated || isAnonymous, [
    authenticated,
    isAnonymous,
  ]);

  return (
    <ThemeProvider theme={theme}>
      <>
        <CssBaseline />
        {requiresLogin && <Login title="Arium Space Editor" />}
        {!requiresLogin && children}
      </>
    </ThemeProvider>
  );
};

const Layout = ({
  children,
  spaceId,
  spaceSlug,
  section,
}: {
  children: React.ReactChild;
  spaceId: string;
  spaceSlug: string;
  section: string;
}) => {
  const authState = useAuthentication({
    ensureSignedInAnonymously: false,
    forceRefreshToken: true,
  });

  const spaceAccess = useSpaceAccess({
    ...authState,
    spaceId,
  });

  return (
    <EnsureAuth authState={authState}>
      <SpaceAccessContext.Provider value={spaceAccess}>
        <Main
          spaceId={spaceId}
          spaceSlug={spaceSlug}
          section={section}
          authState={authState}
          spaceAccess={spaceAccess}
        >
          {children}
        </Main>
      </SpaceAccessContext.Provider>
    </EnsureAuth>
  );
};

export default Layout;
