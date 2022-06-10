import Grid from "@material-ui/core/Grid/Grid";

import { DirectionalLightSettings } from "../../../../spaceTypes";
import { useStyles } from "../../../styles";
import * as Forms from "../../Form";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import SwitchField from "../../Form/SwitchField";
import LightShadowForm from "./LightShadowForm";
import { defaultLightShadowConfig } from "defaultConfigs";

const defaultPosition = () => ({
  x: 0,
  y: 2,
  z: 0,
});

const DirectionalLightForm = ({
  nestedForm,
  defaults,
}: Forms.StandardFormPropsNullable<DirectionalLightSettings>) => {
  const {
    values,
    handleFieldChanged,
    makeNestedFormProps,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues: defaults,
  });

  const positionForm = makeNestedFormProps("position");

  const {
    values: positionValues,
    handleFieldChanged: handlePositionChanged,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm: positionForm,
    defaultValues: defaultPosition,
  });

  const classes = useStyles();

  return (
    <Grid container>
      <Grid item xs={12}>
        <Forms.Number
          initialValue={positionValues.y}
          setValue={handlePositionChanged("y")}
          step={0.01}
          min={1}
          label="height"
        />
      </Grid>
      <Grid item xs={12}>
        <div className={classes.formRow}>
          <SwitchField
            label="Cast Shadow? (Turn on cautiously, this can cause serious performance issues)."
            value={values.castShadow}
            setValue={handleFieldChanged("castShadow")}
          ></SwitchField>
        </div>
        {values.castShadow && (
          <LightShadowForm
            nestedForm={makeNestedFormProps("shadowConfig")}
            defaults={defaultLightShadowConfig}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default DirectionalLightForm;
