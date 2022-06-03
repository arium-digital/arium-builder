import Grid from "@material-ui/core/Grid/Grid";
import {
  useNullableChangeHandlersWithDefaults,
  useThemeableChangeHandlers,
} from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../Form";
import { FrameConfiguration } from "../../../spaceTypes/image";
import {
  defaultFrameConfig,
  defaultMaterialConfig,
} from "../../../defaultConfigs";
import FormSection, {
  FormSectionDisplaySettings,
} from "Editor/components/Form/FormSection";
import { HasFrameConfig } from "spaceTypes/text";
// import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";

export const HasFrameForm = ({
  title = "Frame Settings",
  defaultExpanded,
  notExpandable,
  ...props
}: Forms.StandardFormPropsThemable<HasFrameConfig> &
  FormSectionDisplaySettings) => {
  const {
    values,
    makeNestedFormProps,
    handleFieldChanged,
  } = useThemeableChangeHandlers(props);

  return (
    <Grid item xs={12}>
      <FormSection {...{ title, defaultExpanded, notExpandable }}>
        <Grid item xs={12}>
          <Forms.Switch
            value={values.hasFrame}
            setValue={handleFieldChanged("hasFrame")}
            label="Has a Frame"
          />
        </Grid>
        {values.hasFrame && (
          <FrameForm
            nestedForm={makeNestedFormProps("frameConfig")}
            defaults={defaultFrameConfig}
            formSection={false}
          />
        )}
      </FormSection>
    </Grid>
  );
};

const FrameForm = ({
  nestedForm,
  defaults: defaultValues,
  title = "Frame Settings",
  formSection = true,
  defaultExpanded,
}: Forms.StandardFormPropsNullable<FrameConfiguration> & {
  title?: string;
  formSection?: boolean;
  defaultExpanded?: boolean;
}) => {
  const {
    values,
    handleFieldChanged,
    makeNestedFormProps,
  } = useNullableChangeHandlersWithDefaults({ nestedForm, defaultValues });

  const materialProps = makeNestedFormProps("material");

  const materialHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm: materialProps,
    defaultValues: defaultMaterialConfig,
  });

  const inner = (
    <>
      <Forms.Number
        label="Frame Border"
        initialValue={values.border || 0}
        setValue={handleFieldChanged("border")}
      />
      <Forms.Number
        label="Frame Depth"
        initialValue={values.depth || 0}
        setValue={handleFieldChanged("depth")}
      />
      <Forms.ColorPicker
        label={"Frame Color"}
        value={materialHandlers.values.color}
        setValue={materialHandlers.handleFieldChanged("color")}
      />
      {/* <MaterialForm
        title={"Advanced Frame Material Settings"}
        nestedForm={materialProps}
        defaults={defaultMaterialConfig}
      /> */}
    </>
  );

  if (!formSection) return inner;

  return (
    <Grid item xs={12}>
      <FormSection title={title} defaultExpanded={defaultExpanded}>
        {inner}
      </FormSection>
    </Grid>
  );
};

export default FrameForm;
