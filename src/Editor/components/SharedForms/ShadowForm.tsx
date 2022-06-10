import { ShadowConfig } from "../../../spaceTypes";
import SwitchField from "../Form/SwitchField";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import FormSection from "Editor/components/Form/FormSection";
import * as Forms from "../Form";

export const defaultShadowConfig = (): ShadowConfig => ({
  cast: false,
  receive: false,
});

const ShadowForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<ShadowConfig>) => {
  const { values, handleFieldChanged } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  return (
    <FormSection title="Shadow Settings">
      <SwitchField
        key="cast"
        value={values.cast || false}
        setValue={handleFieldChanged("cast")}
        label={"Cast Shadow"}
      />
      <SwitchField
        key="receive"
        value={values.receive || false}
        setValue={handleFieldChanged("receive")}
        label={"Receive Shadow"}
      />
    </FormSection>
  );
};

export default ShadowForm;
