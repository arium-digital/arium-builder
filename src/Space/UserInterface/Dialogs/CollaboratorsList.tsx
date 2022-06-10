import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import React, {
  useCallback,
  useState,
  useEffect,
  SyntheticEvent,
  MouseEvent,
} from "react";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import styles from "./dialog.module.scss";
import * as yup from "yup";
import { useFormik } from "formik";
import { error as logError } from "firebase-functions/lib/logger";
import { spaceInvitesCollection, userProfilesDoc } from "shared/documentPaths";
import { firestoreTimeNow, functions } from "db";
import InputAdornment from "@material-ui/core/InputAdornment";
import Input from "@material-ui/core/Input";
import {
  SpaceInvite,
  SpaceRoleProfile,
  SpaceRoles,
  UpdateSpaceRolesRequest,
  UserProfile,
} from "../../../../shared/sharedTypes";
import List from "@material-ui/core/List";
import { MdOutlineEditOff, MdOutlineModeEditOutline } from "react-icons/md";
import CopyPopover from "./shared/CopyPopover";
import Grid from "@material-ui/core/Grid";
import FormGroup from "@material-ui/core/FormGroup";
import LinkIcon from "@material-ui/icons/Link";
import Tooltip from "@material-ui/core/Tooltip";
import { SpaceRouteKeys } from "Space/SpaceRoute/useSpaceQueryParams";

type FormData = Pick<SpaceInvite, "role" | "email">;

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const addInvite = ({
  vals,
  spaceId,
  userId,
}: {
  vals: FormData;
  spaceId: string;
  userId: string;
}): Promise<void> => {
  const spaceInvite: SpaceInvite = {
    ...vals,
    fromUserId: userId,
    createdTime: firestoreTimeNow(),
    pending: true,
    claimed: false,
  };

  return new Promise((res, rej) =>
    spaceInvitesCollection(spaceId)
      .add(spaceInvite)
      .then(() => {
        setTimeout(res, 300);
      })
      .catch((err) => {
        logError("Error when sending beta sign up info to db", err);
        setTimeout(() => rej(err), 300);
      })
  );
};

const CollaboratorInviteForm = ({
  spaceId,
  userId,
}: {
  spaceId: string;
  userId: string;
}) => {
  // const { authenticated } = useAuthentication({
  //   ensureSignedInAnonymously: true,
  // });
  const [saving, setSaving] = useState(false);
  const formik = useFormik<FormData>({
    initialValues: {
      email: "",
      role: "editor",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setSaving(true);
      addInvite({ vals: values, spaceId, userId })
        .then(() => {
          // handleSetSubmitted(values);
          setSaving(false);

          formik.resetForm();
        })
        .catch((error) => {
          console.error(error);
          setSaving(false);
        });
    },
  });
  const stopPropagation = useCallback((e: SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        onKeyDown={stopPropagation}
        className={styles.listForm}
      >
        <Grid container>
          <Grid item xs={8} style={{ paddingRight: "10px" }}>
            <FormGroup>
              <Input
                id="email"
                type="email"
                value={formik.values.email}
                placeholder="Email"
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                // helperText={formik.touched.email ? formik.errors.email : ""}
                style={{ lineHeight: "40px" }}
                disabled={saving}
                endAdornment={
                  <InputAdornment
                    position="end"
                    style={{ marginRight: "10px" }}
                  >
                    <span>can edit</span>
                  </InputAdornment>
                }
              />
            </FormGroup>
          </Grid>
          <Grid item xs={4}>
            <div className={styles.formButtonContainer}>
              <button
                className={styles.formButton}
                id="enter"
                disabled={formik.isSubmitting}
                type="submit"
              >
                Send Invite
              </button>
            </div>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export type UserRowProps = {
  id: string;
  displayName: string | null;
  editor: boolean;
  owner: boolean;
  spaceId: string;
  isSelf: boolean;
};

export const useUserProfile = (userId: string | undefined) => {
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>();

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = userProfilesDoc(userId).onSnapshot((doc) => {
      setUserProfile(doc.data() as UserProfile);
    });

    // cleanup
    return () => {
      unsubscribe();
    };
  }, [userId]);

  return userProfile;
};

const updateSpaceRoles = async (args: UpdateSpaceRolesRequest) => {
  await functions().httpsCallable("updateSpaceRoles")(args);
};

export const PendingUserRow = ({
  email,
  inviteUrl,
}: {
  email: string;
  inviteUrl: string;
}) => {
  const [copied, setCopied] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const copyInviteLink = useCallback(
    (e: MouseEvent) => {
      if (e.target) setAnchorEl(e.target as HTMLElement);
      e.preventDefault();

      navigator.clipboard.writeText(inviteUrl);

      setCopied(true);
    },
    [inviteUrl]
  );
  const handleClosePopover = useCallback(() => {
    setCopied(false);
  }, []);
  return (
    <>
      <ListItem>
        <ListItemAvatar>
          <Avatar
            alt={email}
            // src={userProfile?.photoURL || undefined}
          />
        </ListItemAvatar>
        <ListItemText
          primary={`${email} (pending)`}
          // secondary={secondary ? 'Secondary text' : null}
        />
        <ListItemSecondaryAction>
          <a
            href={inviteUrl}
            onClick={copyInviteLink}
            className={styles.formLink}
          >
            copy link
          </a>
          <IconButton
            edge="end"
            aria-label="Copy to Clipboard"
            color="primary"
            onClick={copyInviteLink}
          >
            <LinkIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <CopyPopover
        open={copied}
        anchorEl={anchorEl}
        handleClose={handleClosePopover}
      />
    </>
  );
};

export const UserRow = ({
  id,
  editor,
  owner,
  isSelf,
  spaceId,
}: UserRowProps) => {
  const [changingDisabled, setChangingDisabled] = useState(false);

  const userProfile = useUserProfile(id);

  const handleChangeCanEdit = useCallback(
    async (shouldEdit: boolean) => {
      setChangingDisabled(true);

      try {
        const toSubmit: UpdateSpaceRolesRequest = {
          toChangeUserId: id,
          spaceId,
          editor: {
            remove: !shouldEdit,
            add: shouldEdit,
          },
        };

        await updateSpaceRoles(toSubmit);
      } catch (e) {
        console.error(e);
      } finally {
        setChangingDisabled(false);
      }
    },
    [id, spaceId]
  );

  const displayText = `${userProfile?.displayName || ""}${
    isSelf ? " (self)" : ""
  }`;

  const canBeChanged = !owner && !isSelf;

  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar alt={displayText} src={userProfile?.photoURL || undefined} />
      </ListItemAvatar>
      <ListItemText
        primary={displayText}
        // secondary={secondary ? 'Secondary text' : null}
      />
      <ListItemSecondaryAction>
        {(editor || owner) && (
          <>
            <span className={styles.listButtonText}>
              {owner ? "owner" : "can edit"}
            </span>

            <Tooltip
              title={`Disable space editing for ${userProfile?.displayName}`}
            >
              <IconButton
                edge="end"
                aria-label="Disable Space Editing"
                color="primary"
                disabled={changingDisabled || !canBeChanged}
                onClick={() => handleChangeCanEdit(false)}
              >
                <MdOutlineModeEditOutline />
              </IconButton>
            </Tooltip>
          </>
        )}
        {!editor && !owner && (
          <>
            <span className={styles.listButtonText}>can view</span>

            <Tooltip
              title={`Enable space editing for ${userProfile?.displayName}`}
            >
              <IconButton
                edge="end"
                aria-label="Enable Space Editing"
                disabled={changingDisabled || !canBeChanged}
                onClick={() => handleChangeCanEdit(true)}
              >
                <MdOutlineEditOff />
              </IconButton>
            </Tooltip>
          </>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const pendingInviteUrl = ({
  spaceSlug,
  inviteId,
}: {
  spaceSlug: string;
  inviteId: string;
}) => {
  const host = window.location.hostname;
  const protocol = window.location.protocol;

  return `${protocol}//${host}/spaces/${spaceSlug}?${SpaceRouteKeys.invite}=${inviteId}`;
};

export function useSpaceCollaboratorInvites({
  spaceId,
  pendingOnly,
  spaceSlug,
}: {
  spaceId: string;
  pendingOnly?: boolean;
  spaceSlug: string;
}) {
  const [collaboratorInvites, setCollaboratorInvites] = useState<
    (SpaceInvite & { id: string; url: string })[]
  >([]);

  useEffect(() => {
    const query = pendingOnly
      ? spaceInvitesCollection(spaceId).where("pending", "==", true)
      : spaceInvitesCollection(spaceId);
    const unsub = query.onSnapshot((snap) => {
      const result = snap.docs.map((doc) => ({
        ...(doc.data() as SpaceInvite),
        id: doc.id,
        url: pendingInviteUrl({
          spaceSlug,
          inviteId: doc.id,
        }),
      }));
      setCollaboratorInvites(result);
    });

    return () => unsub();
  }, [spaceId, pendingOnly, spaceSlug]);

  return collaboratorInvites;
}

export type CollaboratorsProps = {
  spaceId: string;
  userId: string;
  spaceRoles: SpaceRoles | undefined;
  spaceSlug: string;
};

const Collaborators = ({
  spaceId,
  userId,
  spaceRoles,
  spaceSlug,
}: CollaboratorsProps) => {
  const pendingInvites = useSpaceCollaboratorInvites({
    spaceId,
    pendingOnly: true,
    spaceSlug,
  });
  const [spaceRoleEntries, setSpaceRoleEntries] = useState<
    UserRowProps[] | undefined
  >();

  // const spaceRoles$ = useBehaviorSubjectFromCurrentValue(spaceRoles);

  useEffect(() => {
    if (!spaceRoles || !spaceRoles.profiles) return;

    const toProfileWithRole = ([id, profile]: [string, SpaceRoleProfile]) => ({
      id,
      ...profile,
      owner: spaceRoles.owners?.includes(id) || false,
      editor: spaceRoles.editors?.includes(id) || false,
      spaceId,
      isSelf: id === userId,
    });

    const profilesWithRoles = Object.entries(spaceRoles.profiles).map(
      toProfileWithRole
    );

    type ProfileWithRole = ReturnType<typeof toProfileWithRole>;

    const sortProfiles = (
      profileA: ProfileWithRole,
      profileB: ProfileWithRole
    ) => {
      if (profileA.isSelf) return 1;
      if (profileB.isSelf) return -1;
      if (profileA.owner && !profileB.owner) return 1;
      if (profileB.owner && !profileA.owner) return -1;
      return (profileA.displayName || "").localeCompare(
        profileB.displayName || ""
      );
    };

    const sortedProfiles = profilesWithRoles.sort(sortProfiles);

    setSpaceRoleEntries(sortedProfiles);
  }, [spaceRoles, spaceId, userId]);

  return (
    <>
      <CollaboratorInviteForm spaceId={spaceId} userId={userId} />
      <List dense={true}>
        {pendingInvites.map((pendingInvite) => (
          <PendingUserRow
            key={pendingInvite.id}
            email={pendingInvite.email}
            inviteUrl={pendingInvite.url}
          />
        ))}
        {spaceRoleEntries?.map((userProfile) => (
          <UserRow key={userProfile.id} {...userProfile} />
        ))}
      </List>
    </>
  );
};

export default Collaborators;
