import Grid from "@material-ui/core/Grid/Grid";
import Paper from "@material-ui/core/Paper/Paper";

import { PointLightConfig } from "../../../../spaceTypes";
import { useStyles } from "../../../styles";
import * as Forms from "../../Form";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";

const PointLightForm = ({
  nestedForm,
  defaults,
}: Forms.StandardFormPropsNullable<PointLightConfig>) => {
  const { values, handleFieldChanged } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues: defaults,
  });

  const classes = useStyles();

  return (
    <Grid item xs={12}>
      <Grid item xs={12} lg={6}>
        <Paper className={classes.paper}>
          <Forms.Slider
            exponential={false}
            min={0}
            max={100}
            label="Distance"
            value={values.distance}
            setValue={handleFieldChanged("distance")}
            description="How far the point light should project to."
          />
        </Paper>
      </Grid>
      <Grid item xs={12} lg={6}>
        <Paper className={classes.paper}>
          <Forms.Slider
            exponential={false}
            label="Decay"
            min={0}
            max={5}
            value={values.decay}
            setValue={handleFieldChanged("decay")}
            description="How much the light decays. 0 means it does not decay at all."
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PointLightForm;
