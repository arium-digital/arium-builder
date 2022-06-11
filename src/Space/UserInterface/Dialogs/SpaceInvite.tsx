import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import { useNullableDocument } from "hooks/useDocument";
import { useCallback, useState, useMemo, useEffect } from "react";
import { spaceInvite as spaceInvitePath } from "shared/documentPaths";
import {
  AcceptSpaceInviteRequest,
  SpaceInvite as SpaceInviteType,
} from "../../../../shared/sharedTypes";
import { useUserProfile } from "./CollaboratorsList";
import cta from "css/cta.module.scss";
import styles from "./dialog.module.scss";
import ModalDialog from "./shared/ModalDialog";
import { auth, functions } from "db";
import { buildSignUpConfig } from "hooks/auth/useAuthentication";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import authStyles from "website/css/auth.module.scss";
import { Optional } from "types";

const RegisterToCollaborate = () => {
  const uiConfig = useMemo(
    () => buildSignUpConfig({ prefix: "Continue with" }),
    []
  );

  const localAuth = useMemo(() => auth(), []);

  return (
    <>
      <StyledFirebaseAuth
        uiConfig={uiConfig}
        firebaseAuth={localAuth}
        className={authStyles.firebaseAuth}
      />
    </>
  );
};

const AcceptInvitation = ({
  accept,
  disabled,
  spaceInvite,
}: {
  accept: () => void;
  disabled?: boolean;
  spaceInvite?: SpaceInviteType;
}) => {
  return (
    <div
      className={cta.container}
      style={{
        width: "400px",
        top: "10px",
        left: 0,
        margin: "30px auto 20px auto",
      }}
    >
      <button
        onClick={accept}
        className={cta.primary}
        id="enter"
        disabled={disabled}
      >
        Accept Invitation and Collaborate
      </button>
    </div>
  );
};

const SpaceInvite = ({
  inviteId,
  userId,
  spaceId,
  spaceSlug,
  spaceName,
  isAnonymous,
  onComplete,
}: {
  spaceId: string;
  spaceSlug: string;
  inviteId: string;
  spaceName: string;
  onComplete: () => void;
  isAnonymous: boolean;
  userId: Optional<string>;
}) => {
  const spaceInvite = useNullableDocument<SpaceInviteType>({
    path: spaceInvitePath({ spaceId, inviteId }).path,
  });

  const userProfile = useUserProfile(spaceInvite?.fromUserId);

  const [open, setOpen] = useState(true);

  const handleComplete = useCallback(() => {
    setOpen(false);
    onComplete();
  }, [onComplete]);

  const [submitting, setSubmitting] = useState(false);

  const [spaceInviteError, setSpaceInviteError] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (spaceInvite?.claimed) {
      if (spaceInvite?.claimedByUserId !== userId) {
        setSpaceInviteError(
          "Oops, it looks like this invite has already been claimed.  Please contact info@arium.xyz for further assistance."
        );
      } else {
        onComplete();
      }
    }
  }, [spaceInvite?.claimed, spaceInvite?.claimedByUserId, userId, onComplete]);

  const acceptInvitation = useCallback(async () => {
    setSubmitting(true);

    try {
      const request: AcceptSpaceInviteRequest = {
        inviteId,
        spaceId,
      };
      const result = (
        await functions().httpsCallable("acceptSpaceInvitation")(request)
      ).data as {
        success: boolean;
        error?: string;
      };

      if (result.success) {
        handleComplete();
      } else {
        setSpaceInviteError(result.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }, [inviteId, spaceId, handleComplete]);

  if (!spaceInvite || !userProfile || !open) return null;

  return (
    <ModalDialog
      open={open}
      handleClose={handleComplete}
      size="large"
      backdropDisabled
    >
      <>
        <div className={styles.centeredContents}>
          <Typography variant="h2">Welcome</Typography>
          <Typography variant="h3">
            You've been invited to collaborate on and edit the space {spaceName}
            !
          </Typography>
          <Divider />
          {spaceInviteError && (
            <p style={{ margin: "20px 0" }}>{spaceInviteError}</p>
          )}
          {!spaceInviteError && (
            <>
              {isAnonymous && <RegisterToCollaborate />}
              {!isAnonymous && (
                <AcceptInvitation
                  accept={acceptInvitation}
                  disabled={submitting}
                  spaceInvite={spaceInvite}
                />
              )}
            </>
          )}
        </div>
      </>
    </ModalDialog>
  );
};

export default SpaceInvite;
