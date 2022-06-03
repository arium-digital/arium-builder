import Grid from "@material-ui/core/Grid/Grid";
import { ScreenShareConfig } from "../../../spaceTypes";
import * as Forms from "../Form";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import FormSection, { FormSectionDisplaySettings } from "../Form/FormSection";
import { Editors, FormDescription } from "Editor/types";
import useFormFields from "Editor/hooks/useFormFields";

const formDescription: FormDescription<
  ScreenShareConfig,
  "guestsCanScreenShare"
> = {
  guestsCanScreenShare: {
    editor: Editors.switch,
    editorConfig: {
      label: "Guests can screenshare",
      description:
        "If checked, then guests can screenshare.  Otherwise, only editors of the space can screenshare.",
    },
  },
};

export const ScreenShareContentsForm = ({
  nestedForm,
  defaults: defaultValues,
  title = "Screen Share Settings",
  defaultExpanded,
  notExpandable,
}: Forms.StandardFormPropsNullable<ScreenShareConfig> &
  FormSectionDisplaySettings) => {
  const { values, handleFieldChanged } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const { FormFields, props } = useFormFields(
    formDescription,
    handleFieldChanged,
    values
  );

  return (
    <FormSection {...{ title, defaultExpanded, notExpandable }}>
      <FormFields.guestsCanScreenShare {...props} />
    </FormSection>
  );
};

const ScreenShareForm = (
  props: Forms.StandardFormPropsNullable<ScreenShareConfig>
) => {
  return (
    <Grid container>
      <Grid item xs={6}>
        <ScreenShareContentsForm {...props} defaultExpanded />
      </Grid>
    </Grid>
  );
};

export default ScreenShareForm;
