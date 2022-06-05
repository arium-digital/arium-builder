import Grid from "@material-ui/core/Grid/Grid";
import {
  FlatShapeConfig,
  CircleConfig,
  RectangleConfig,
} from "../../../spaceTypes";
import { useStyles } from "../../styles";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../Form";
import {
  defaultCircleConfig,
  defaultRectangleConfig,
} from "../../../defaultConfigs";
import { SubElementHeader, ElementHelperText } from "../VisualElements/Text";

const CircleForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<CircleConfig>) => {
  const { values, handleFieldChanged } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const classes = useStyles();

  return (
    <>
      <Grid container>
        <Grid item xs={6}>
          <Forms.Number
            label="Radius"
            initialValue={values.radius || 5}
            min={0}
            setValue={handleFieldChanged("radius")}
            step={0.1}
          />
        </Grid>
        <Grid item xs={6}>
          <Forms.Number
            label="Segments"
            initialValue={values.segments || 10}
            min={3}
            setValue={handleFieldChanged("segments")}
            step={1}
          />
        </Grid>
        <Grid item xs={12}>
          <div className={classes.formRow}>
            <Forms.SliderRange
              min={0}
              max={360}
              value={[values.thetaStart || 0, values.thetaEnd || 360]}
              setFirstValue={handleFieldChanged("thetaStart")}
              setSecondValue={handleFieldChanged("thetaEnd")}
              description="Theta Start/End"
              isAngle
              step={1}
            />
          </div>
        </Grid>
      </Grid>
    </>
  );
};

const RectangleForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<RectangleConfig>) => {
  const { values, handleFieldChanged } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  return (
    <Grid container>
      <Grid item xs={6}>
        <Forms.Number
          label="Width"
          initialValue={values.width || 2}
          min={0.1}
          setValue={handleFieldChanged("width")}
          step={0.1}
        />
      </Grid>
      <Grid item xs={6}>
        <Forms.Number
          label="Height"
          initialValue={values.height || 2}
          min={0.1}
          setValue={handleFieldChanged("height")}
          step={0.1}
        />
      </Grid>
    </Grid>
  );
};

const FlatShapeForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<FlatShapeConfig>) => {
  const {
    values,
    handleFieldChanged,
    makeNestedFormProps,
  } = useNullableChangeHandlersWithDefaults({ nestedForm, defaultValues });
  const classes = useStyles();

  return (
    <>
      <SubElementHeader>Shape Settings</SubElementHeader>
      <ElementHelperText>
        When a user is inside this shape, they will be broadcasted
      </ElementHelperText>
      <div className={classes.formRow}>
        <Forms.SelectButtons
          options={["circle", "rectangle"]}
          value={values.kind || "circle"}
          // @ts-ignore
          setValue={handleFieldChanged("kind")}
        />
      </div>
      {values.kind === "circle" && (
        <CircleForm
          nestedForm={makeNestedFormProps("circle")}
          defaults={defaultCircleConfig}
        />
      )}
      {values.kind === "rectangle" && (
        <RectangleForm
          nestedForm={makeNestedFormProps("rectangle")}
          defaults={defaultRectangleConfig}
        />
      )}
    </>
  );
};

export default FlatShapeForm;
