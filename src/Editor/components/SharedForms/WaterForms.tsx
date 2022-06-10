import Grid from "@material-ui/core/Grid/Grid";
import React from "react";
import { WaterConfig } from "../../../spaceTypes/water";
import { useFormFields } from "../../hooks/useFormFields";
import { Editors, FormDescription } from "../../types";
import * as FileSelect from "../Files/FileSelect";
import { modelFileExtensions } from "../Files/extensions";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import FormSection from "../Form/FormSection";

const waterFormDescription: FormDescription<
  WaterConfig,
  | "isGround"
  | "flowSpeed"
  | "reflectivity"
  | "color"
  | "scale"
  | "resolution"
  | "surfaceType"
> = {
  color: {
    editor: Editors.colorPicker,
    editorConfig: {
      label: "Color",
      description: "Color of the material",
    },
  },
  scale: {
    editor: Editors.numberField,
    editorConfig: {
      min: 0,
      label: "Scale",
      description: "Scale of the ripples.",
    },
  },
  reflectivity: {
    editor: Editors.slider,
    editorConfig: {
      min: 0,
      max: 3,
      label: "Reflectivity",
      description: "The reflectivity of the water surface.",
      exponential: true,
    },
  },
  flowSpeed: {
    editor: Editors.numberField,
    editorConfig: {
      min: 0,
      label: "Flow Speed",
      description: "The speed of the water flow.",
    },
  },
  isGround: {
    editor: Editors.switch,
    editorConfig: {
      label: "is ground",
      description: "if the reflector should act as a ground plane.",
    },
  },
  resolution: {
    editor: Editors.select,
    editorConfig: {
      label: "resolution",
      description:
        "The resolution of the water. Higher is going to be higher fidelity but can slow down performance when many media elements are visible in the space.",
      options: [128, 256, 512],
    },
  },
  surfaceType: {
    editor: Editors.select,
    editorConfig: {
      label: "Water geometry type",
      description:
        "Geometry of the water.  The water material will be rendered on this geometry",
      // @ts-ignore
      options: ["plane", "3d geometry"],
    },
  },
};

export const WaterSettingsForm = ({
  values,
  handleFieldChanged,
}: UseChangeHandlerResult<WaterConfig>) => {
  const { FormFields, props } = useFormFields(
    waterFormDescription,
    handleFieldChanged,
    values
  );

  return (
    <Grid item xs={12}>
      <FormSection title="Water Settings" defaultExpanded>
        <Grid container spacing={4}>
          <Grid item sm={12} md={6} lg={4}>
            <FormFields.flowSpeed {...props} />
          </Grid>
          <Grid item sm={12} md={6} lg={4}>
            <FormFields.scale {...props} />
          </Grid>
          <Grid item xs={12}>
            <FormFields.color {...props} />
          </Grid>
          <Grid item sm={12}>
            <FormFields.reflectivity {...props} />
          </Grid>
          <Grid item sm={12}>
            <FormFields.resolution {...props} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <FormFields.isGround {...props} />
          </Grid>
        </Grid>
      </FormSection>
    </Grid>
  );
};

export const WaterGeometryForm = ({
  values,
  handleFieldChanged,
}: UseChangeHandlerResult<WaterConfig>) => {
  const { FormFields, props } = useFormFields(
    waterFormDescription,
    handleFieldChanged,
    values
  );

  return (
    <Grid item xs={12}>
      <FormSection title="Water Geometry" defaultExpanded>
        <Grid item xs={12}>
          <FormFields.surfaceType {...props} />
        </Grid>
        {values.surfaceType === "3d geometry" && (
          <Grid item xs={12}>
            <FileSelect.Model
              disablePaper
              fieldName="Water Geometry Model File"
              file={values.surfaceGeometryFile}
              handleChanged={handleFieldChanged("surfaceGeometryFile")}
              extensions={modelFileExtensions}
              allowExternalFile
            />
          </Grid>
        )}
      </FormSection>
    </Grid>
  );
};
