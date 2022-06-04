import { Button, Grid, ModalProps, Typography } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import React, { useCallback, useState, MouseEvent, ChangeEvent } from "react";
import styles from "./dialog.module.scss";
import { IconBetaSignUp } from "website/home/utils";
import { EditorState } from "Space/InSpaceEditor/types";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import LinkIcon from "@material-ui/icons/Link";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { HasPlayerLocationObservable, PlayerLocation } from "types";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { SpaceRouteKeys } from "Space/SpaceRoute/useSpaceQueryParams";
import { roundToPrecision } from "Editor/components/Form/NumberField";
import Collaborators, { CollaboratorsProps } from "./CollaboratorsList";
import CopyPopover from "./shared/CopyPopover";
import ModalDialog from "./shared/ModalDialog";

const shareAtQuery = (playerLocation: PlayerLocation) => {
  const pairs: [string, string][] = [
    [
      SpaceRouteKeys.x,
      roundToPrecision(playerLocation.position[0], 1).toString(),
    ],
    [
      SpaceRouteKeys.y,
      roundToPrecision(playerLocation.position[1] + 3, 1).toString(),
    ],
    [
      SpaceRouteKeys.z,
      roundToPrecision(playerLocation.position[2], 1).toString(),
    ],
    [
      SpaceRouteKeys.lx,
      roundToPrecision(playerLocation.lookAt[0], 2).toString(),
    ],
    [
      SpaceRouteKeys.ly,
      roundToPrecision(playerLocation.lookAt[1], 2).toString(),
    ],
    [
      SpaceRouteKeys.lz,
      roundToPrecision(playerLocation.lookAt[2], 2).toString(),
    ],
  ];
  return `?${pairs.map((pair) => pair.join("=")).join("&")}`;
};

const shareLink = ({
  spaceSlug,
  shareAtLocation,
  playerLocation,
}: {
  spaceSlug: string;
  shareAtLocation: boolean;
  playerLocation: PlayerLocation | null;
}) => {
  const host = window.location.hostname;
  const protocol = window.location.protocol;

  const query =
    shareAtLocation && playerLocation ? shareAtQuery(playerLocation) : "";

  return {
    url: `${protocol}//${host}/spaces/${spaceSlug}${query}`,
    text: `${host}/spaces/${spaceSlug}${query}`,
  };
};

const ShareFooter = ({
  spaceSlug,
  playerLocation$,
}: { spaceSlug: string } & HasPlayerLocationObservable) => {
  const [copied, setCopied] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [shareAtLocation, setShareAtLocation] = useState(false);

  const playerLocation = useCurrentValueFromObservable(playerLocation$, null);

  const shareLinkResult = spaceSlug
    ? shareLink({ spaceSlug, shareAtLocation, playerLocation })
    : undefined;

  const copyToClipboard = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      if (e.target) setAnchorEl(e.target as HTMLElement);

      if (shareLinkResult) navigator.clipboard.writeText(shareLinkResult.url);

      setCopied(true);
    },
    [shareLinkResult]
  );

  const handleClosePopover = useCallback(() => {
    setCopied(false);
  }, []);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setShareAtLocation(event.target.checked as boolean);
  }, []);

  return (
    <>
      <Grid container className={styles.copyLinkHolder}>
        <Grid item xs={9}>
          <Input
            id="url-input"
            type="text"
            value={shareLinkResult?.text}
            style={{ width: "100%" }}
            startAdornment={
              <InputAdornment position="end" style={{ marginLeft: 0 }}>
                <IconButton
                  aria-label="Copy Link to Clipboard"
                  onClick={copyToClipboard}
                  style={{ cursor: "pointer", padding: "12px 8px 12px 0" }}
                  // onMouseDown={handleMouseDownPassword}
                >
                  <LinkIcon />
                </IconButton>
              </InputAdornment>
            }
            inputProps={{
              readOnly: true,
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <Button onClick={copyToClipboard} className={styles.copyButton}>
            <>
              <IconBetaSignUp /> Copy
            </>
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {playerLocation && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={shareAtLocation}
                  onChange={handleChange}
                  name="shareAtLocation"
                  color="primary"
                />
              }
              label="Share at current location"
            />
          </>
        )}
      </Grid>
      <CopyPopover
        open={copied}
        anchorEl={anchorEl}
        handleClose={handleClosePopover}
      />
    </>
  );
};

// {canInviteToEdit && open && userId && spaceId && (
//       <>
//         <Collaborators
//           userId={userId}
//           spaceId={spaceId}
//           spaceRoles={editorState?.spaceRoles}
//         />
//         <Divider />
//       </>
//     )}
//     {open && (

const NonCollaboratorShareDialog = ({
  spaceSlug,
  playerLocation$,
  open,
}: {
  spaceSlug: string;
  open: boolean;
} & HasPlayerLocationObservable) => {
  return (
    <>
      <Typography variant="h2">Share this space</Typography>
      <Divider />
      {open && (
        <ShareFooter spaceSlug={spaceSlug} playerLocation$={playerLocation$} />
      )}
    </>
  );
};

const CollaboratorShareDialog = ({
  spaceSlug,
  playerLocation$,
  open,
  ...rest
}: {
  spaceSlug: string;

  open: boolean;
} & HasPlayerLocationObservable &
  CollaboratorsProps) => {
  return (
    <>
      <Typography variant="h3" className={styles.headerForList}>
        Invite Collaborators
      </Typography>
      {open && (
        <>
          <Collaborators {...rest} spaceSlug={spaceSlug} />
          <Divider />
          <Typography
            variant="h3"
            className={styles.headerForList}
            style={{ marginTop: 20 }}
          >
            Share this Space
          </Typography>
          <div className={styles.headerForList}>
            <ShareFooter
              spaceSlug={spaceSlug}
              playerLocation$={playerLocation$}
            />
          </div>
        </>
      )}
    </>
  );
};

const ShareDialog = ({
  open,
  // onClose,
  handleClose,
  canInviteToEdit,
  spaceSlug,
  playerLocation$,
  spaceId,
  userId,
  editorState,
}: Pick<ModalProps, "open"> & {
  handleClose: () => void;
  editorState: EditorState | null;
  canInviteToEdit: boolean;
  spaceSlug: string;
  spaceId: string | undefined;
  userId: string | undefined;
} & HasPlayerLocationObservable) => {
  return (
    <ModalDialog open={open} handleClose={handleClose} size="small">
      <>
        {canInviteToEdit && open && userId && spaceId ? (
          <>
            <CollaboratorShareDialog
              spaceSlug={spaceSlug}
              playerLocation$={playerLocation$}
              spaceId={spaceId}
              spaceRoles={editorState?.spaceRoles}
              userId={userId}
              open={open}
            />
          </>
        ) : (
          <NonCollaboratorShareDialog
            spaceSlug={spaceSlug}
            playerLocation$={playerLocation$}
            open={open}
          />
        )}
      </>
    </ModalDialog>
  );
};

export default ShareDialog;
