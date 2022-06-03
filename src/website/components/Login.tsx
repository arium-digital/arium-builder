import React, { useMemo } from "react";
import { buildConfig } from "hooks/auth/useAuthentication";
import authStyles from "../css/auth.module.scss";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { auth } from "db";

const Login = ({
  userId,
  isNewUser,
}: {
  userId?: string;
  isNewUser: boolean;
}) => {
  const uiConfig = useMemo(() => buildConfig(), []);

  return (
    <StyledFirebaseAuth
      uiConfig={uiConfig}
      firebaseAuth={auth()}
      className={authStyles.firebaseAuth}
    />
  );
};

export default Login;
