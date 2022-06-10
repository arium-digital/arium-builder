import { useStyles } from "../../styles";
import { Transform } from "../../../spaceTypes";
import * as Forms from "../Form";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import EditVectorThree, {
  makDefaultOnesVector3,
  makDefaultZerosVector3,
} from "../Form/EditVectorThree";
import React, { FC } from "react";

const defaultStep = 0.01;

const TransformForm: FC<Forms.StandardFormPropsNullable<Transform>> = ({
  nestedForm,
  defaults: defaultValues,
}) => {
  const classes = useStyles();

  const { makeNestedFormProps } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  return (
    <Grid container className={classes.gridRoot}>
      <Grid item xs={6} lg={4}>
        <Paper className={classes.paper}>
          <EditVectorThree
            uniform
            description="scale"
            nestedForm={makeNestedFormProps("scale")}
            defaults={makDefaultOnesVector3}
            step={defaultStep}
          />
        </Paper>
      </Grid>
      <Grid item xs={6} lg={4}>
        <Paper className={classes.paper}>
          <EditVectorThree
            description="position"
            nestedForm={makeNestedFormProps("position")}
            defaults={makDefaultZerosVector3}
            step={defaultStep}
          />
        </Paper>
      </Grid>
      <Grid item xs={6} lg={4}>
        <Paper className={classes.paper}>
          <EditVectorThree
            isAngle
            description="rotation"
            nestedForm={makeNestedFormProps("rotation")}
            defaults={makDefaultZerosVector3}
            step={defaultStep}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TransformForm;
