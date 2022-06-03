import Grid from "@material-ui/core/Grid/Grid";
import Paper from "@material-ui/core/Paper/Paper";
import { BroadcastZoneConfig } from "../../../spaceTypes";
import { useStyles } from "../../styles";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../Form";
import {
  defaultBroadcastZoneSoundConfig,
  defaultFlatShapeConfig,
} from "../../../defaultConfigs";
import { ElementHeader, ElementHelperText } from "../VisualElements/Text";
import FlatShapeForm from "./FlatShapeForm";
import PositionalAudioForm from "./PositionalAudioForm";

const ScreenShareForm = ({
  nestedForm,
  defaults,
}: Forms.StandardFormPropsNullable<BroadcastZoneConfig>) => {
  const {
    values,
    handleFieldChanged,
    makeNestedFormProps,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues: defaults,
  });

  const classes = useStyles();

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <ElementHeader>Brodcast Zone Settings</ElementHeader>
            <ElementHelperText>
              When a user is in a broadcast their video is visible to everyone,
              and their audio is broadcast to everyone. The audio will taper off
              based off of the positional audio settings.
            </ElementHelperText>
          </Paper>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12} lg={6}>
          <Paper className={classes.paper}>
            <FlatShapeForm
              nestedForm={makeNestedFormProps("shape")}
              defaults={defaultFlatShapeConfig}
            />
            <Forms.Switch
              label="Visualize"
              value={values.visualize}
              setValue={handleFieldChanged("visualize")}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper className={classes.paper}>
            <PositionalAudioForm
              nestedForm={makeNestedFormProps("sound")}
              defaults={defaultBroadcastZoneSoundConfig}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ScreenShareForm;
