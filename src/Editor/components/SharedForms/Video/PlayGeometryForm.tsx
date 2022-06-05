import { ModelConfig } from "../../../../spaceTypes";
import { modelFileExtensions } from "../../Files/extensions";
import ShadowForm, { defaultShadowConfig } from "../ShadowForm";
import * as Forms from "../../Form";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import React from "react";
import * as FileSelect from "../../Files/FileSelect";
import * as Previews from "../../Form/Previews";
import Divider from "@material-ui/core/Divider";
import FormSection from "Editor/components/Form/FormSection";

const PlayGeometryForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<ModelConfig>) => {
  const useChangeHandlerResult = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });
  const {
    values,
    handleFieldChanged,
    makeNestedFormProps,
    errors,
  } = useChangeHandlerResult;
  return (
    <FormSection title="3d Play Geometry" defaultExpanded>
      <FileSelect.Model
        disablePaper
        fieldName="Model File"
        file={values.modelFile}
        handleChanged={handleFieldChanged("modelFile")}
        errors={errors?.modelFile}
        extensions={modelFileExtensions}
        allowExternalFile
      />
      {values.modelFile && <Previews.ModelElement config={values} />}
      <FormSection title="Animation Settings">
        <Forms.Switch
          value={values.animated || false}
          setValue={handleFieldChanged("animated")}
          label="Animated"
        />
        {values.animated && (
          <Forms.Number
            initialValue={values.animationTimeScale || 1}
            label="Time Scale"
            step={0.1}
            setValue={handleFieldChanged("animationTimeScale")}
          />
        )}
        <Divider />
        <Forms.Switch
          value={values.syncAnimation || false}
          setValue={handleFieldChanged("syncAnimation")}
          label="Synchronize Animation Time"
          description="If set to true, this will attempt to ensure that multiple users viewing this animated model in the same space will see it at the same point in time.  This may result in some jitteriness in animations when the animation time is adjusted. Useful for things like elevators."
        />
      </FormSection>
      <FormSection title="Physics Settings">
        <Forms.Switch
          key={"isGround"}
          value={values.isGround || false}
          setValue={handleFieldChanged("isGround")}
          label={"is ground"}
        />
        <Forms.Switch
          key={"isCollidable"}
          value={values.isCollidable || false}
          setValue={handleFieldChanged("isCollidable")}
          label={"is collidable"}
        />
      </FormSection>
      <ShadowForm
        nestedForm={makeNestedFormProps("shadow")}
        defaults={defaultShadowConfig}
      />
    </FormSection>
  );
};

export default PlayGeometryForm;
