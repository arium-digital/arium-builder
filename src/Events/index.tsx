import React, { useEffect } from "react";
import globalStyles from "css/globalStyles";
import useUserIdChanged from "hooks/auth/useUserIdChanged";
import { useAuthentication } from "hooks/auth/useAuthentication";
import { AnimatedAriumLogo } from "Space/AnimatedAriumLogo";
import { EventLandingPage } from "./EventLandingPage";
import { Layout } from "./Layout";
import { EventInfo } from "../../shared/sharedTypes";

const EventRoute = ({ event }: { event: EventInfo }) => {
  const authState = useAuthentication({ ensureSignedInAnonymously: true });

  const userIdChanged = useUserIdChanged(authState.userId);

  useEffect(() => {
    if (userIdChanged) window.location.reload();
  }, [userIdChanged]);

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
