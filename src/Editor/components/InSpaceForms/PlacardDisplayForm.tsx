import React from "react";
import * as Forms from "../Form";
import Grid from "@material-ui/core/Grid";
import { useThemeableChangeHandlers } from "Editor/hooks/useNullableChangeHandlers";
import { useFormFields } from "Editor/hooks/useFormFields";
import { Editors, FormDescription } from "Editor/types";
import { SimplifiedBackingAndFrameForm } from "../SharedForms/PlacardForms";
import FormSection from "../Form/FormSection";
import { PlacardDisplayConfig } from "spaceTypes/placard";

const placardDisplayFormDescription: FormDescription<
  PlacardDisplayConfig,
  "hasBacking" | "fontSize" | "primaryFontColor"
> = {
  fontSize: {
    editor: Editors.numberField,
    editorConfig: {
      label: "Font Size",
      min: 0,
      max: 20,
    },
  },
  primaryFontColor: {
    editor: Editors.colorPicker,
    editorConfig: {
      label: "Font Color",
    },
  },
  hasBacking: {
    editor: Editors.switch,
    editorConfig: {
      label: "Has a Box",
    },
  },
};

const PlacardDisplayForm = ({
  nestedForm,
  getThemeDefault,
  defaultExpanded,
}: Forms.StandardFormPropsThemable<PlacardDisplayConfig> & {
  defaultExpanded?: boolean;
}) => {
  const changeHandlers = useThemeableChangeHandlers({
    nestedForm,
    getThemeDefault,
  });

  const { values, errors, handleFieldChanged } = changeHandlers;

  const { FormFields, props } = useFormFields(
    placardDisplayFormDescription,
    // @ts-ignore
    handleFieldChanged,
    values
  );

  return (
    <Grid item xs={12}>
      <FormSection title="Placard Text Style" defaultExpanded={defaultExpanded}>
        <Grid container>
          <Grid container>
            <Grid item xs={6}>
              <Forms.FontSelect
                font={values.font}
                handleChanged={handleFieldChanged("font")}
                error={errors?.font}
              />
            </Grid>
            <Grid item xs={6}>
              <FormFields.fontSize {...props} />
            </Grid>
          </Grid>

          <Grid container>
            <Grid item xs={6}>
              <FormFields.primaryFontColor {...props} />
            </Grid>
          </Grid>
        </Grid>
      </FormSection>
      <FormSection
        title="Placard Box Settings"
        defaultExpanded={defaultExpanded}
      >
        <SimplifiedBackingAndFrameForm
          {...changeHandlers}
          showBackingPadding={true}
          notExpandable
        />
      </FormSection>
    </Grid>
  );
};

export default PlacardDisplayForm;
