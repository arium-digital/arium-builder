import { Button, Divider, Grid, Typography } from "@material-ui/core";
import { AnimatedAriumLogo } from "Space/AnimatedAriumLogo";
import { useAuthentication } from "hooks/auth/useAuthentication";
import React from "react";
import { Layout2, NavProps } from "website/Layout/Layout2";
import { LoginModal } from "website/shared/LoginModal";
import { SpaceList } from "./SpaceList";
import styles from "./styles.module.scss";
import { useSpaceAccess } from "hooks/auth/useSpaceAccess";
import { LoadingLinear } from "Space/Loading";
import useSpaceCreationStatus from "website/spaceCreation/useSpaceCreationStatus";

const navProps: NavProps = { navItems: ["documentation", "my-spaces"] };

export const MySpaces = () => {
  const authState = useAuthentication({
    ensureSignedInAnonymously: false,
    forceRefreshToken: true,
  });
  const { authenticated, pending, refreshClaims, userId } = authState;

  const spaceAccess = useSpaceAccess({
    ...authState,
    refreshClaims,
    spaceId: undefined,
  });

  const createdSpacesStatus = useSpaceCreationStatus({
    userId,
    spaceAccess,
  });

  if (pending) return <AnimatedAriumLogo hint="Authenticating..." />;
  return (
    <>
      <Layout2 navProps={navProps}>
        <LoginModal fullScreen authState={authState} />
        {authenticated && (
          <Grid container direction="column" spacing={8}>
            <Grid item container justify="space-between" alignItems="center">
              <Typography variant="h1">Your Spaces</Typography>
              {createdSpacesStatus?.text && (
                <Typography variant="h6">{createdSpacesStatus.text}</Typography>
              )}
              {createdSpacesStatus?.canCreate && (
                <Button color="primary" variant="contained" href="/spaces/new">
                  Create a Space
                </Button>
              )}
            </Grid>
            <Grid item>
              <Divider className={styles.divider} />
            </Grid>
            <Grid item>
              {!spaceAccess.pending && (
                <SpaceList
                  spaceAccess={spaceAccess}
                  availableSpacesToCreate={
                    createdSpacesStatus?.availableToCreate || 0
                  }
                />
              )}
              {spaceAccess.pending && <LoadingLinear width="100%" />}
            </Grid>
          </Grid>
        )}
      </Layout2>
    </>
  );
};
