import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import React, { FC, useCallback, useMemo } from "react";
import { ElementConfig } from "../../../spaceTypes";
import { useStyles } from "../../styles";
import ElementForm from "./ElementForm";
import { Delete } from "@material-ui/icons";
import { NestedFormProp, WithConfirmationDialog } from "../Form";
import { Button, Grid, IconButton, Tooltip } from "@material-ui/core";
import { DialogConfig } from "../Form/WithConfirmationDialog";

import { useValidateAndUpdate } from "Editor/hooks/updateAndCreate";
import { ElementSchema } from "Editor/formAndSchema";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import { DocumentReference } from "db";
import RemoveRedEyeIcon from "@material-ui/icons/RemoveRedEye";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import { TopToolbarForm } from "Editor/components/InSpaceForms/InSpaceElementForm";
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

const EditHeader = ({
  elementConfig,
  nestedForm,
  handleDuplicate,
  duplicating,
}: {
  elementConfig: ElementConfig;
  nestedForm: NestedFormProp<ElementConfig> | null;
  handleDuplicate: () => void;
  duplicating: boolean;
}) => {
  const deleted = useMemo(() => elementConfig?.deleted === true, [
    elementConfig?.deleted,
  ]);

  return (
    <Grid container justify="space-between">
      <Grid>
        <Typography variant="h4">
          {!deleted
            ? `Editing ${elementConfig.name}`
            : `${elementConfig.name} (deleted)`}
        </Typography>
      </Grid>
      <Grid>
        {nestedForm && (
          <>
            <TopToolbarForm
              nestedForm={nestedForm}
              duplicate={handleDuplicate}
              duplicating={duplicating}
            />
          </>
        )}
      </Grid>
    </Grid>
  );
};

const Edit: FC<{
  spaceId: string;
  elementRef: DocumentReference;
  handleDuplicate: () => void;
  duplicating: boolean;
}> = ({ spaceId, elementRef, handleDuplicate, duplicating }) => {
  const { nestedForm } = useValidateAndUpdate<ElementConfig>({
    ref: elementRef,
    schema: ElementSchema,
    autoSave: true,
    // converter: extractElementConfig,
  });

  const elementConfig = nestedForm?.values;

  const classes = useStyles();

  if (!elementConfig) return null;

  return (
    <>
      <Paper className={classes.paper}>
        <EditHeader
          elementConfig={elementConfig}
          nestedForm={nestedForm}
          handleDuplicate={handleDuplicate}
          duplicating={duplicating}
        />
      </Paper>
      {elementConfig.deleted !== true && nestedForm && (
        <ElementForm
          nestedForm={nestedForm}
          spaceId={spaceId}
          disableTypeChanged={true}
          elementId={elementRef.id}
        />
      )}
    </>
  );
};

export default Edit;
