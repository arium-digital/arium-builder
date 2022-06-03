import React, { FC } from "react";
import {
  defaultReflectorConfig,
  defaultReflectorMaterialConfig,
  ReflectorConfig,
  ReflectorMaterialConfig,
  ReflectorSurfaceConfig,
} from "../../../spaceTypes/reflectorSurface";
import { FormDescription, Editors } from "../../types";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import FrameForm from "./FrameForm";
import * as Text from "../VisualElements/Text";
import * as Forms from "../Form";
import Grid from "@material-ui/core/Grid/Grid";
import Paper from "@material-ui/core/Paper/Paper";
import { useStyles } from "../../styles";
import { useFormFields } from "../../hooks/useFormFields";
import { defaultFrameConfig } from "defaultConfigs";
import ElementPreview from "../Form/ElementPreview";
import ReflectorSurface from "components/Elements/ReflectorSurface";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import FormSection from "../Form/FormSection";

const reflectorSurfaceFormDescription: FormDescription<
  ReflectorSurfaceConfig,
  "hasFrame" | "width" | "height" | "doubleSided" | "isCollidable" | "isGround"
> = {
  doubleSided: {
    editor: Editors.switch,
    editorConfig: {
      label: "Double Sided",
      description: "Rendering reflection at both sides of the surface.",
    },
  },
  hasFrame: {
    editor: Editors.switch,
    editorConfig: {
      label: "Has a Frame",
      description: "Adding a frame to the surface.",
    },
  },
  width: {
    editor: Editors.numberField,
    editorConfig: {
      min: 0,
      label: "Width",
      description: "The width of the surface.",
    },
  },
  height: {
    editor: Editors.numberField,
    editorConfig: {
      min: 0,
      label: "Height",
      description: "The height of the surface.",
    },
  },
  isCollidable: {
    editor: Editors.switch,
    editorConfig: {
      label: "is collidable",
      description:
        "if the user should be prevented from walking through the reflector.",
    },
  },
  isGround: {
    editor: Editors.switch,
    editorConfig: {
      label: "is ground",
      description: "if the reflector should act as a ground plane.",
    },
  },
};

const ReflectorFormDescription: FormDescription<
  ReflectorConfig,
  "resolution" | "mixBlur" | "mixStrength" | "mirror"
> = {
  resolution: {
    editor: Editors.slider,
    editorConfig: {
      label: "Resolution",
      description:
        "Off-buffer resolution, lower=faster, higher=better quality.",
      max: 10,
      min: 4,
      step: 1,
      exponential: true,
    },
  },
  mixBlur: {
    editor: Editors.slider,
    editorConfig: {
      label: "Mix Blur",
      description:
        "How much blur mixes with surface roughness. Works better with low resolution",
      min: 0,
      max: 3,
      exponential: true,
    },
  },
  mixStrength: {
    editor: Editors.slider,
    editorConfig: {
      label: "Mix Strength",
      description: "Strength of the reflections",
      min: 0,
      max: 4,
      step: 0.1,
      exponential: true,
    },
  },
  mirror: {
    editor: Editors.slider,
    editorConfig: {
      label: "Mirror",
      description:
        "Mirror environment, 0 = texture colors, 1 = pick up env colors",
      max: 1,
      min: 0,
      step: 0.01,
    },
  },
};

const MaterialFormDescription: FormDescription<
  ReflectorMaterialConfig,
  "roughness" | "metalness" | "color" | "transparent" | "opacity"
> = {
  roughness: {
    editor: Editors.slider,
    editorConfig: {
      label: "Roughness",
      description: "How rough the surface appears",
      max: 4,
      min: 0,
      exponential: true,
    },
  },
  metalness: {
    editor: Editors.slider,
    editorConfig: {
      label: "Metalness",
      description: "How much the material is like a metal",
      max: 4,
      min: 0,
      exponential: true,
    },
  },
  color: {
    editor: Editors.colorPicker,
    editorConfig: {
      label: "Color",
      description: "Color of the material",
    },
  },
  transparent: {
    editor: Editors.switch,
    editorConfig: {
      label: "Transparent",
    },
  },
  opacity: {
    editor: Editors.slider,
    editorConfig: {
      label: "Opacity",
      min: 0,
      max: 1,
    },
  },
};

const ReflectorForm: FC<Forms.StandardFormPropsNullable<ReflectorConfig>> = ({
  nestedForm,
  defaults,
}) => {
  const { values, handleFieldChanged } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues: defaults,
  });

  const { FormFields, props } = useFormFields(
    ReflectorFormDescription,
    handleFieldChanged,
    values
  );

  return (
    <>
      <FormFields.resolution {...props} />
      <FormFields.mirror {...props} />
      <FormFields.mixStrength {...props} />
      <FormFields.mixBlur {...props} />
    </>
  );
};

const ReflectorMaterialForm: FC<
  Forms.StandardFormPropsNullable<ReflectorMaterialConfig>
> = ({ nestedForm, defaults }) => {
  const { values, handleFieldChanged } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues: defaults,
  });

  const { FormFields, props } = useFormFields(
    MaterialFormDescription,
    handleFieldChanged,
    values
  );

  return (
    <FormSection title="Reflector Material">
      <FormFields.color {...props} />
      <FormFields.roughness {...props} />
      <FormFields.metalness {...props} />
      <FormFields.transparent {...props} />
      {props.values.transparent && <FormFields.opacity {...props} />}
    </FormSection>
  );
};

export const ReflectorSettingsForm = ({
  values,
  handleFieldChanged,
  makeNestedFormProps,
}: UseChangeHandlerResult<ReflectorSurfaceConfig>) => {
  const { FormFields, props } = useFormFields(
    reflectorSurfaceFormDescription,
    handleFieldChanged,
    values
  );

  return (
    <>
      <Grid item xs={12}>
        <FormSection title="Reflector Settings" defaultExpanded>
          {/* <FormFields.width {...props} />
        <FormFields.height {...props} /> */}
          <ReflectorForm
            nestedForm={makeNestedFormProps("reflectorConfig")}
            defaults={defaultReflectorConfig}
          />
          <FormFields.doubleSided {...props} />
        </FormSection>
        <ReflectorMaterialForm
          nestedForm={makeNestedFormProps("materialConfig")}
          defaults={defaultReflectorMaterialConfig}
        />
        <FormSection title="Physics">
          <FormFields.isGround {...props} />
          <FormFields.isCollidable {...props} />
        </FormSection>
      </Grid>
    </>
  );
};

export const ReflectorFrameForm = ({
  values,
  handleFieldChanged,
  makeNestedFormProps,
}: UseChangeHandlerResult<ReflectorSurfaceConfig>) => {
  const { FormFields, props } = useFormFields(
    reflectorSurfaceFormDescription,
    handleFieldChanged,
    values
  );

  return (
    <Grid item xs={12}>
      <FormSection defaultExpanded title="Reflector Frame">
        <Text.SubElementHeader>Frame</Text.SubElementHeader>
        <FormFields.hasFrame {...props} />
        {values.hasFrame && (
          <FrameForm
            nestedForm={makeNestedFormProps("frameConfig")}
            defaults={defaultFrameConfig}
          />
        )}
      </FormSection>
    </Grid>
  );
};

const ReflectorSurfaceForm: FC<
  Forms.StandardFormPropsNullable<ReflectorSurfaceConfig>
> = ({ nestedForm, defaults: defaultValues }) => {
  // const values = useConfigOrDefaultRecursive(
  //   config,
  //   defaultReflectorSurfaceConfig
  // );
  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const { values } = changeHandlers;

  const classes = useStyles();

  return (
    <>
      <Grid container>
        <Grid item xs={6}>
          <Grid container>
            <Grid item xs={12}>
              <ReflectorSettingsForm {...changeHandlers} />
            </Grid>
            <Grid item xs={12}>
              <ReflectorFrameForm {...changeHandlers} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <Text.SubElementHeader>
              Reflector Element Preview
            </Text.SubElementHeader>
            <ElementPreview loaded={true}>
              <ReflectorSurface config={values} />
            </ElementPreview>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ReflectorSurfaceForm;
