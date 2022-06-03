import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Layout from "./layout";
import { useAuthentication } from "hooks/auth/useAuthentication";

const Login = () => {
  const router = useRouter();
  const { redirect } = router.query;

  const { authenticated, isAnonymous } = useAuthentication({
    ensureSignedInAnonymously: false,
  });

  useEffect(() => {
    if (authenticated && !isAnonymous) {
      // once we have become authenticated, go to previous page
      router.push((redirect as string | undefined) || "/my-spaces");
    }
  }, [authenticated, router, isAnonymous, redirect]);

  return <Layout format="signUpFlow" requireAuth />;
};

export default Login;
