import { LightShadowConfig } from "../../../../spaceTypes";
import { useStyles } from "../../../styles";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../../Form";
import { usePowersOfTwo } from "../../Form/utils";
import FormSection from "Editor/components/Form/FormSection";
import Grid from "@material-ui/core/Grid";
import { useMemo } from "react";

const maxShadowSize = Math.pow(2, 10);

const LightShadowForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<LightShadowConfig>) => {
  const {
    values,
    handleFieldChanged,
    errors,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const classes = useStyles();

  const powersOfTwo = usePowersOfTwo({
    min: 4,
    max: maxShadowSize,
  });

  const buttons = useMemo(() => {
    const all = powersOfTwo.map((x) => x.label);

    const firstHalf = all.slice(0, Math.floor(all.length / 2));

    const secondHalf = all.slice(Math.floor(all.length / 2), all.length);

    return {
      firstHalf,
      secondHalf,
    };
  }, [powersOfTwo]);

  return (
    <Grid item xs={12}>
      <FormSection title="Advanced Light Shadow Settings">
        <div className={classes.formRow}>
          <label>Shadow Map Size</label>
          <br />
          <Forms.SelectButtons
            options={buttons.firstHalf}
            value={values.mapSize?.toString()}
            setValue={(x) => handleFieldChanged("mapSize")(+x)}
          />
          <br />
          <Forms.SelectButtons
            options={buttons.secondHalf}
            value={values.mapSize?.toString()}
            setValue={(x) => handleFieldChanged("mapSize")(+x)}
          />
        </div>
        <div className={classes.formRow}>
          <Forms.Number
            initialValue={values.cameraFar}
            setValue={handleFieldChanged("cameraFar")}
            step={1}
            label={"Shadow Map Camera Far"}
            error={errors?.cameraFar}
          />
          <Forms.Number
            initialValue={values.cameraSize}
            setValue={handleFieldChanged("cameraSize")}
            step={1}
            label={"Shadow Map Camera Size"}
            error={errors?.cameraSize}
          />
          <Forms.Number
            initialValue={values.bias}
            setValue={handleFieldChanged("bias")}
            step={0.00001}
            label={"Shadow Bias"}
          />
        </div>
      </FormSection>
    </Grid>
  );
};

export default LightShadowForm;
