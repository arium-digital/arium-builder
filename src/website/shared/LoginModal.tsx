import { Box, Grid, Modal, Paper, Typography } from "@material-ui/core";
import clsx from "clsx";
import styleUtils from "css/styleUtils.module.scss";
import { AuthState } from "hooks/auth/useAuthentication";
import React, { useMemo } from "react";
import Login from "../components/Login";
import { AriumLogo } from "./AriumLogoNew";
import { Centered } from "./utils";
/**
 * Notes:
 * I want to turn login into a modal so that it doesn't need to manage nav and footer
 */

/**
 *
 * @param param0
 *    if open === undefined, it opens automatically if user is not authenticated
 *    you can control when to open it by explicitly pass prop `open`
 * @returns
 */
export const LoginModal = ({
  open,
  authState,
  allowAnonymous,
  fullScreen,
}: {
  fullScreen?: boolean;
  allowAnonymous?: boolean;
  open?: boolean;
  authState: AuthState;
}) => {
  const { authenticated, isAnonymous, isNewUser, userId } = authState;
  const shouldOpen = useMemo(() => {
    // explicitly passed open has highest proirity
    if (open !== undefined) return open;
    // if open is undefined, test if is authenticated and if is anonymous
    if (allowAnonymous) return !authenticated;
    // if not allow anonymous, requires sign in if is anonymous or is unauthenticated
    return !authenticated || isAnonymous;
  }, [allowAnonymous, authenticated, isAnonymous, open]);

  return (
    <Modal open={shouldOpen} className={styleUtils.fullViewport}>
      <div>
        <Centered>
          <Paper
            className={clsx(
              fullScreen && styleUtils.fullViewport,
              styleUtils.overflowYScroll
            )}
          >
            <Centered>
              <Box maxWidth="100vw" width="800px" padding="2rem">
                <Grid
                  container
                  direction="column"
                  alignItems="center"
                  spacing={4}
                >
                  <Grid item>
                    <AriumLogo />
                  </Grid>
                  <Grid item>
                    <Typography variant="h2" align="center">
                      Welcome To Arium
                    </Typography>
                    <Typography variant="body1" align="center">
                      Please sign in to get started
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Login isNewUser={isNewUser} userId={userId} />
                  </Grid>
                </Grid>
              </Box>
            </Centered>
          </Paper>
        </Centered>
      </div>
    </Modal>
  );
};
