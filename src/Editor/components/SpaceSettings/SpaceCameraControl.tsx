import { useMemo } from "react";
import { useStyles } from "../../styles";
import Paper from "@material-ui/core/Paper";
import { useValidateAndUpdate } from "Editor/hooks/updateAndCreate";
import { spaceExperimentalCameraDocument } from "../../../shared/documentPaths";
import Grid from "@material-ui/core/Grid";
import { defaultExperimentalCameraSettings } from "defaultConfigs";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../Form";
import * as Text from "../VisualElements/Text";

import { ExperimentalCameraConfig } from "types";

const CameraSettingsForm = ({
  nestedForm,
  defaults,
  title,
}: Forms.StandardFormPropsNullable<ExperimentalCameraConfig> & {
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

  const defaultValues = useMemo(defaults, [defaults]);
  return (
    <>
      <Text.SubElementHeader>{title}</Text.SubElementHeader>
      <Forms.Number
        label={`Camera FOV (default: ${defaultValues.fov})`}
        setValue={handleFieldChanged("fov")}
        initialValue={config.fov || defaultValues.fov}
        step={2}
        error={errors?.fov}
        size="lg"
        min={1}
        max={1000}
      />
      <Forms.Number
        label={`Camera Max Distance (default: ${defaultValues.far})`}
        setValue={handleFieldChanged("far")}
        initialValue={config.far || defaultValues.far}
        step={10}
        error={errors?.far}
        size="lg"
        min={1}
        max={1000}
      />
    </>
  );
};

export const SpaceCameraControl = ({ spaceId }: { spaceId: string }) => {
  const documentRef = useMemo(() => spaceExperimentalCameraDocument(spaceId), [
    spaceId,
  ]);

  const { nestedForm } = useValidateAndUpdate<ExperimentalCameraConfig>({
    ref: documentRef,
    schema: undefined,
    autoSave: true,
    defaultIfMissing: defaultExperimentalCameraSettings,
  });

  const classes = useStyles();

  if (!nestedForm) return null;

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Paper className={classes.paper}>
        <CameraSettingsForm
          nestedForm={nestedForm}
          defaults={defaultExperimentalCameraSettings}
          title={"Camera Settings"}
        />
      </Paper>
    </Grid>
  );
};
