import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { useAuthenticationConfig } from "hooks/auth/useAuthentication";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { auth } from "db";

const Login = ({ title }: { title: string }) => {
  const uiConfig = useAuthenticationConfig();

  return (
    <>
      <Grid container justify="center">
        <Grid item xs={4}>
          <br />
          <Typography variant="h3">{title}</Typography>
          <br />
        </Grid>
      </Grid>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth()} />
    </>
  );
};

export default Login;
