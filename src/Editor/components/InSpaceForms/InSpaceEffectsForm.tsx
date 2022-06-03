import { useValidateAndUpdate } from "Editor/hooks/updateAndCreate";
import { useMemo } from "react";
import { spaceEffectsDoc } from "shared/documentPaths";
import Grid from "@material-ui/core/Grid/Grid";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { Effect, Effects, SpaceEffects } from "components/PostProcessing/types";
import { NestedFormPropWithUpdatedId } from "Editor/components/Form";
import * as Forms from "Editor/components/Form";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import { Editors, FormDescription } from "Editor/types";
import useFormFields from "Editor/hooks/useFormFields";
import FormSection from "Editor/components/Form/FormSection";
import { defaultSpaceEffects } from "defaultConfigs";
import { PushUndoItemFunction } from "Editor/hooks/useUndo";

const bloomFormDescription: FormDescription<
  Effect,
  "intensity" | "luminanceThreshold" | "luminanceSmoothing" | "width" | "height"
> = {
  intensity: {
    editor: Editors.slider,
    editorConfig: {
      label: "Bloom intensity",
      min: 0,
      max: 1,
      description: "The bloom intensity",
    },
  },
  luminanceThreshold: {
    editor: Editors.slider,
    editorConfig: {
      label: "Luminance threshold",
      min: 0,
      max: 1,
      description:
        "The luminance threshold. Raise this value to mask out darker elements in the scene.",
    },
  },
  luminanceSmoothing: {
    editor: Editors.numberField,
    editorConfig: {
      label: "Luminance smoothing",
      min: 0,
      max: 0.3,
      description: "Controls the smoothness of the luminance threshold..",
    },
  },
  width: {
    editor: Editors.numberField,
    editorConfig: {
      label: "Width",
      min: 0,
      max: 600,
      description: "The render width.",
    },
  },
  height: {
    editor: Editors.numberField,
    editorConfig: {
      label: "Height",
      min: 0,
      max: 600,
      description: "The render height.",
    },
  },
};

// export tye

const BloomForm = ({
  values,
  handleFieldChanged,
  sourceValues,
  errors,
}: UseChangeHandlerResult<Effect>) => {
  const { FormFields, props } = useFormFields(
    bloomFormDescription,
    handleFieldChanged,
    values,
    errors
  );
  return (
    <>
      <Forms.Switch
        value={values.enabled}
        setValue={handleFieldChanged("enabled")}
        label="Enable Bloom Filter"
      />
      {values.enabled && (
        <>
          <FormSection title="Bloom Filter Settings" defaultExpanded>
            <Grid container>
              <FormFields.intensity {...props} />
              <FormFields.luminanceThreshold {...props} />
              {/* <FormFields.luminanceSmoothing {...props} /> */}
            </Grid>
            {/* <Grid container>
              <Grid item xs={6}>
                <FormFields.width {...props} />
              </Grid>
              <Grid item xs={6}>
                <FormFields.height {...props} />
              </Grid>
            </Grid> */}
          </FormSection>
        </>
      )}
    </>
  );
};

const emptyPostprocesing = () => defaultSpaceEffects().postProcessing;

const emptyBloom = () => emptyPostprocesing()?.Bloom;

const EffectsFormInner = ({
  nestedForm,
}: {
  nestedForm: NestedFormPropWithUpdatedId<SpaceEffects>;
}) => {
  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues: defaultSpaceEffects,
  });

  const postProcessingChangeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm: changeHandlers.makeNestedFormProps("postProcessing"),

    defaultValues: emptyPostprocesing,
  }) as UseChangeHandlerResult<Effects>;

  const bloomChangeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm: postProcessingChangeHandlers.makeNestedFormProps("Bloom"),
    defaultValues: emptyBloom,
  }) as UseChangeHandlerResult<Effect>;

  // const values = postProcessingChangeHandlers.values;
  // const handleFieldChanged = postProcessingChangeHandlers.handleFieldChanged;

  return (
    <Grid item xs={12}>
      <FormSection title="Postprocessing Effects" defaultExpanded>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <BloomForm {...bloomChangeHandlers} />
          </Grid>
        </Grid>
      </FormSection>
    </Grid>
  );
};

const InSpaceEffectsForm = ({
  spaceId,
  pushUndoItem,
}: {
  spaceId: string;
  pushUndoItem: PushUndoItemFunction;
}) => {
  const ref = useMemo(() => spaceEffectsDoc(spaceId), [spaceId]);

  const { nestedForm } = useValidateAndUpdate<SpaceEffects>({
    ref,
    autoSave: true,
    schema: undefined,
    defaultIfMissing: defaultSpaceEffects,
    pushUndoItem,
  });

  if (!nestedForm) return null;
  return <EffectsFormInner nestedForm={nestedForm} />;
};

export default InSpaceEffectsForm;
