import React, { useCallback } from "react";
import { ElementConfig } from "../../../spaceTypes";
import { Delete } from "@material-ui/icons";
import { WithConfirmationDialog } from "../Form";
import { Button, IconButton, Tooltip } from "@material-ui/core";
import { DialogConfig } from "../Form/WithConfirmationDialog";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import RemoveRedEyeIcon from "@material-ui/icons/RemoveRedEye";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";
// import { extractElementConfig } from "defaultConfigs/conversions";

const deletionDialogConfig: DialogConfig = {
  title: "Delete this element?",
  content: "Deleting element will also delete all its children.",
};

export const DeleteElement = ({
  changeHandlers,
}: {
  changeHandlers: UseChangeHandlerResult<ElementConfig>;
}) => {
  const {
    values: { deleted },
    handleFieldChanged,
  } = changeHandlers;

  const handleDelete = useCallback(() => {
    handleFieldChanged("deleted")(!deleted);
  }, [deleted, handleFieldChanged]);

  return (
    <>
      {deleted ? (
        <Button onClick={handleDelete}>Restore</Button>
      ) : (
        <WithConfirmationDialog dialogConfig={deletionDialogConfig}>
          <Tooltip title="Delete element">
            <IconButton>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button>Cancel</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </WithConfirmationDialog>
      )}
    </>
  );
};

export const ToggleElementActive = ({
  changeHandlers,
}: {
  changeHandlers: UseChangeHandlerResult<ElementConfig>;
}) => {
  const {
    values: { active },
    handleFieldChanged,
  } = changeHandlers;

  const handleToggleEnabled = useCallback(() => {
    handleFieldChanged("active")(!active);
  }, [active, handleFieldChanged]);

  return (
    <>
      <Tooltip title={active ? "Hide Element" : "Show Element"}>
        <IconButton onClick={handleToggleEnabled}>
          {active && <RemoveRedEyeIcon />}
          {!active && <VisibilityOffIcon />}
        </IconButton>
      </Tooltip>
    </>
  );
};

export const ToggleElementLocked = ({
  changeHandlers,
}: {
  changeHandlers: UseChangeHandlerResult<ElementConfig>;
}) => {
  const {
    values: { locked },
    handleFieldChanged,
  } = changeHandlers;

  const handleToggleEnabled = useCallback(() => {
    handleFieldChanged("locked")(!locked);
  }, [locked, handleFieldChanged]);

  return (
    <>
      <Tooltip title={locked ? "Unlock Element" : "Lock Element"}>
        <IconButton onClick={handleToggleEnabled}>
          {locked && <LockIcon />}
          {!locked && <LockOpenIcon />}
        </IconButton>
      </Tooltip>
    </>
  );
};
