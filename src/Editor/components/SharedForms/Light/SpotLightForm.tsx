import Grid from "@material-ui/core/Grid/Grid";
import { SpotLightSettings } from "../../../../spaceTypes";
import { useStyles } from "../../../styles";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";

import SliderField from "../../Form/SliderField";
import NumberField from "../../Form/NumberField";
import { Mark } from "@material-ui/core/Slider";
import * as Forms from "../../Form";

const penumbraMarks: Mark[] = [
  { value: 0, label: "0" },
  { value: 1, label: "1" },
];
const angleMarks: Mark[] = [
  { value: 0, label: "0°" },
  { value: 90, label: "90°" },
];

const SpotLightForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<SpotLightSettings>) => {
  const {
    values,
    handleFieldChanged,
    errors,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });
  const classes = useStyles();

  return (
    <Grid container>
      <div className={classes.formRow}>
        <NumberField
          label="Distance"
          initialValue={values.distance || 0}
          step={0.1}
          setValue={handleFieldChanged("distance")}
          error={errors?.distance}
        />
        <SliderField
          label="Angle"
          value={values.angle}
          min={0}
          max={90}
          setValue={handleFieldChanged("angle")}
          marks={angleMarks}
          isAngle
        />
        <SliderField
          label="Decay"
          value={values.decay}
          min={0}
          max={2}
          setValue={handleFieldChanged("decay")}
        />
      </div>
      <div className={classes.formRow}>
        <SliderField
          label="Penumbra"
          value={values.penumbra}
          min={0}
          max={1}
          setValue={handleFieldChanged("penumbra")}
          marks={penumbraMarks}
        />
      </div>
    </Grid>
  );
};

export default SpotLightForm;
