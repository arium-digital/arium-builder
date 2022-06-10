import { ModelConfig } from "../../../spaceTypes";
import { useStyles } from "../../styles";
import { modelFileExtensions } from "../Files/extensions";
import MaterialForm from "./MaterialForm";
import Grid from "@material-ui/core/Grid/Grid";
import ShadowForm, { defaultShadowConfig } from "./ShadowForm";
import * as Forms from "../Form";
import {
  defaultInteractableConfig,
  InteractableConfigForm,
} from "./InteractableConfigForm";
import { defaultMaterialConfig } from "defaultConfigs";
import React from "react";
import * as FileSelect from "../Files/FileSelect";
import Divider from "@material-ui/core/Divider";
import FormSection, { FormSectionDisplaySettings } from "../Form/FormSection";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import { InteractableElement } from "spaceTypes/interactable";

export const ModelAppearanceForm = ({
  values,
  handleFieldChanged,
  makeNestedFormProps,
}: UseChangeHandlerResult<ModelConfig>) => {
  return (
    <Grid item xs={12}>
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
    </Grid>
  );
};

export const MaterialFormSection = ({
  values,
  handleFieldChanged,
  makeNestedFormProps,
  defaultExpanded,
}: UseChangeHandlerResult<ModelConfig> & {
  defaultExpanded?: boolean;
}) => {
  const classes = useStyles();

  return (
    <Grid item xs={12}>
      <FormSection title="Material Settings" defaultExpanded={defaultExpanded}>
        <div className={classes.formRow}>
          <Forms.Number
            initialValue={values.envMapIntensity}
            setValue={handleFieldChanged("envMapIntensity")}
            max={1}
            min={0}
            label="Environment Map Intensity"
            description="Is there is an environment map, how intensly that is applied to this model."
          />
        </div>
        <div className={classes.formRow}>
          <Forms.Switch
            value={values.bundledMaterial}
            setValue={handleFieldChanged("bundledMaterial")}
            label="Bundled in Model File"
          />
        </div>
        {!values.bundledMaterial && (
          <MaterialForm
            nestedForm={makeNestedFormProps("materialConfig")}
            defaults={defaultMaterialConfig}
            defaultExpanded
            showColor
          />
        )}
      </FormSection>
    </Grid>
  );
};

export const InteractableElementForm = ({
  values,
  handleFieldChanged,
  makeNestedFormProps,
  defaultExpanded,
  notExpandable,
  title = "Interactable Settings",
}: UseChangeHandlerResult<InteractableElement> &
  FormSectionDisplaySettings) => {
  return (
    <Grid item xs={12}>
      <FormSection {...{ defaultExpanded, notExpandable, title }}>
        <Forms.Switch
          value={values.interactable || false}
          setValue={handleFieldChanged("interactable")}
          label="Interactable"
        />
        {values.interactable && (
          <InteractableConfigForm
            nestedForm={makeNestedFormProps("interactableConfig")}
            defaults={defaultInteractableConfig}
          />
        )}
      </FormSection>
    </Grid>
  );
};

export const ModelContentForm = ({
  values,
  handleFieldChanged,
  errors,
}: UseChangeHandlerResult<ModelConfig>) => {
  const classes = useStyles();

  return (
    <Grid item xs={12}>
      <FormSection title="Model File" defaultExpanded>
        <div className={classes.formRow}>
          <FileSelect.Model
            disablePaper
            fieldName="Model File"
            file={values.modelFile}
            handleChanged={handleFieldChanged("modelFile")}
            errors={errors?.modelFile}
            extensions={modelFileExtensions}
            allowExternalFile
          />
        </div>
      </FormSection>
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
    </Grid>
  );
};
