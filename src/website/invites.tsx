import React, { useEffect, useMemo, useState } from "react";
import { Invite } from "../../shared/sharedTypes";
import { store, functions } from "db";
import { useRouter } from "next/router";
import {
  trackInviteAlreadyUsed,
  trackInviteClaimed,
  trackInviteOpened,
} from "analytics/acquisition";
import layoutStyles from "./css/layout.module.scss";
import authStyles from "./css/auth.module.scss";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import {
  buildSignUpConfig,
  useAuthentication,
} from "hooks/auth/useAuthentication";
import clsx from "clsx";
import LoadingSpinAnimation from "components/UserInterface/LoadingSpinAnimation";
import { auth } from "db";
import { Layout2 } from "./Layout/Layout2";
import { Typography } from "@material-ui/core";
import { useInitAnalyticsAndIdentify } from "analytics/init";

const LoadingSpin = () => (
  <div className={layoutStyles.loadingWrapper}>
    <div className="d-flex justify-content-center">
      <LoadingSpinAnimation />
    </div>
  </div>
);

const claimInvite = async ({ inviteId }: { inviteId: string }) => {
  await functions().httpsCallable("claimInvite")({ inviteId });
};

const Invites = ({ inviteId }: { inviteId: string | undefined }) => {
  const router = useRouter();
  const [invite, setInvite] = useState<Invite | undefined>();
  const [claimedInvite, setClaimedInvite] = useState(false);

  const [loading, setLoading] = useState(true);

  const [invalidInvite, setInvalidInvite] = useState(false);

  const { authenticated, isAnonymous, userId, isNewUser } = useAuthentication({
    ensureSignedInAnonymously: true,
  });

  useInitAnalyticsAndIdentify({ userId, isAnonymous, isNewUser });

  useEffect(() => {
    if (!authenticated) return;
    if (!inviteId) {
      setInvalidInvite(true);
      return;
    }
    const unsub = store
      .collection("invites")
      .doc(inviteId)
      .onSnapshot(async (snapshot) => {
        setLoading(false);
        if (!snapshot.exists) {
          setInvalidInvite(true);
          return;
        }

        const invite = snapshot.data() as Invite;

        setInvite(invite);

        if (!invite.opened) {
          await snapshot.ref.update({
            opened: true,
          });
        }

        trackInviteOpened({ inviteId });
      });

    return () => {
      unsub();
    };
  }, [inviteId, router, authenticated]);

  const uiConfig = useMemo(() => buildSignUpConfig(), []);

  useEffect(() => {
    (async () => {
      if (
        authenticated &&
        !isAnonymous &&
        userId &&
        !loading &&
        inviteId &&
        invite &&
        !invite.used &&
        !claimedInvite
      ) {
        setClaimedInvite(true);

        await claimInvite({ inviteId });

        trackInviteClaimed({ inviteId });

        router.push("/spaces/new");
      }
    })();
  }, [
    authenticated,
    userId,
    inviteId,
    router,
    claimedInvite,
    loading,
    isAnonymous,
    invite,
  ]);

  const inviteStatus = useMemo(() => {
    if (invalidInvite) return "invalid";
    if (loading) return "loading";
    if (claimedInvite) return "claimedInvite";
    if (invite?.used) {
      if (invite.userId === userId) {
        trackInviteAlreadyUsed({ byCurrentUser: true });

        return "inviteUsedByUser";
      }
      trackInviteAlreadyUsed({ byCurrentUser: false });
      return "inviteUsed";
    }
    return "claimInvite";
  }, [
    claimedInvite,
    invalidInvite,
    invite?.used,
    invite?.userId,
    loading,
    userId,
  ]);

  useEffect(() => {
    // if invite already used by the current user,
    // then redirect to create a new space.
    if (inviteStatus === "inviteUsedByUser") {
      router.push("/spaces/new");
    }
  }, [inviteStatus, router]);

  return (
    <>
      <Layout2>
        <div
          className={clsx(
            layoutStyles.standardContents,
            layoutStyles.alignCenter,
            "text-center"
          )}
        >
          <Typography variant="h1" className="text-center">
            Welcome to Arium
          </Typography>
          <Typography variant="body1" className="text-center">
            The creator platform for unique live metaverse experiences.
          </Typography>
          <br />
          <div className={layoutStyles.mainActions}>
            {inviteStatus === "loading" && <LoadingSpin />}
            {inviteStatus === "invalid" && (
              <Typography variant="h4">
                We're sorry, but it appears the invite you provided is invalid.
                If you feel this is an error, please contact us as{" "}
                <a href="mailto:info@arium.xyz">info@arium.xyz</a>
              </Typography>
            )}
            {(inviteStatus === "claimedInvite" ||
              inviteStatus === "inviteUsedByUser") && <LoadingSpin />}
            {inviteStatus === "claimInvite" && (
              <>
                <Typography variant="h4" align="center">
                  Please register to create your space.
                </Typography>
                <StyledFirebaseAuth
                  uiConfig={uiConfig}
                  firebaseAuth={auth()}
                  className={authStyles.firebaseAuth}
                />
              </>
            )}
          </div>
          {inviteStatus === "inviteUsed" && (
            <Typography variant="h4">
              This invite has already been used. If you feel this is an error,
              please contact us as{" "}
              <a href="mailto:info@arium.xyz">info@arium.xyz</a>
            </Typography>
          )}
        </div>
      </Layout2>
    </>
  );
};

export default Invites;
