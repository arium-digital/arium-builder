import { useMemo } from "react";
import { useStyles } from "../../styles";
import Paper from "@material-ui/core/Paper";
import { useValidateAndUpdate } from "Editor/hooks/updateAndCreate";
import { spacePositionalPhysicsDocument } from "../../../shared/documentPaths";
import Grid from "@material-ui/core/Grid";
import { PhysicsSettings } from "components/componentTypes";
import { defaultPhysicsSettings } from "defaultConfigs";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../Form";
import * as Text from "../VisualElements/Text";
import {
  DEFAULT_MOVEMENT_SPEED,
  DEFAULT_GRAVITY,
  DEFAULT_JUMP_SPEED,
} from "defaultConfigs";

const PhysicsSettingsForm = ({
  nestedForm,
  defaults,
  title,
}: Forms.StandardFormPropsNullable<PhysicsSettings> & {
  title: string;
}) => {
  const {
    values: config,
    handleFieldChanged,
    errors,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues: defaults,
  });

  return (
    <>
      <Text.SubElementHeader>{title}</Text.SubElementHeader>
      <Forms.Number
        label={`Movement Speed (default: ${DEFAULT_MOVEMENT_SPEED})`}
        setValue={handleFieldChanged("movementSpeed")}
        initialValue={config.movementSpeed || DEFAULT_MOVEMENT_SPEED}
        step={0.1}
        error={errors?.movementSpeed}
        size="lg"
        min={0}
        max={20}
      />
      <Forms.Number
        label={`Gravity (default: ${DEFAULT_GRAVITY})`}
        setValue={handleFieldChanged("gravity")}
        initialValue={config.gravity || DEFAULT_GRAVITY}
        step={0.1}
        error={errors?.gravity}
        size="lg"
        min={-5}
        max={5}
      />
      <Forms.Number
        label={`Jump Speed (default: ${DEFAULT_JUMP_SPEED})`}
        setValue={handleFieldChanged("jumpSpeed") || DEFAULT_JUMP_SPEED}
        step={0.1}
        initialValue={config.jumpSpeed}
        error={errors?.jumpSpeed}
        size="lg"
        min={0}
        max={5}
      />
    </>
  );
};

const SpacePhysicsSettings = ({ spaceId }: { spaceId: string }) => {
  const documentRef = useMemo(() => spacePositionalPhysicsDocument(spaceId), [
    spaceId,
  ]);

  const { nestedForm } = useValidateAndUpdate<PhysicsSettings>({
    ref: documentRef,
    schema: undefined,
    autoSave: true,
    defaultIfMissing: defaultPhysicsSettings,
  });

  const classes = useStyles();

  if (!nestedForm) return null;

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Paper className={classes.paper}>
        <PhysicsSettingsForm
          nestedForm={nestedForm}
          defaults={defaultPhysicsSettings}
          title={"Physics Settings"}
        />
      </Paper>
    </Grid>
  );
};

export default SpacePhysicsSettings;
