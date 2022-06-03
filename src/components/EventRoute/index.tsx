import React, { useEffect } from "react";
import globalStyles from "css/globalStyles";
import useUserIdChanged from "hooks/auth/useUserIdChanged";
import { useAuthentication } from "hooks/auth/useAuthentication";
import { AnimatedAriumLogo } from "components/AnimatedAriumLogo";
import { EventLandingPage } from "./EventLandingPage";
import { Layout } from "./Layout";
import { EventInfo } from "../../../shared/sharedTypes";
import { useInitAnalyticsAndIdentify } from "analytics/init";

const EventRoute = ({ event }: { event: EventInfo }) => {
  const authState = useAuthentication({ ensureSignedInAnonymously: true });

  const userIdChanged = useUserIdChanged(authState.userId);

  useEffect(() => {
    if (userIdChanged) window.location.reload();
  }, [userIdChanged]);

  useInitAnalyticsAndIdentify({
    userId: authState.userId,
    isAnonymous: authState.isAnonymous,
    isNewUser: authState.isNewUser,
  });

  // // console.log(authState.authenticated, authState.userId);
  // if (!authState.authenticated || !authState.userId)
  //   return <AnimatedAriumLogo hint="Authenticating..." />;
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const authenticatedAuthState = authState as AuthenticatedAuthState;
  return (
    <>
      <style jsx global>
        {globalStyles}
      </style>
      <Layout>
        {!authState.authenticated || !authState.userId ? (
          <AnimatedAriumLogo hint="Authenticating..." />
        ) : (
          <EventLandingPage event={event} />
        )}
      </Layout>
    </>
  );
};

export default EventRoute;
