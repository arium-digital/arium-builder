import { MaterialConfig } from "../../../spaceTypes";
import { useStyles } from "../../styles";
import * as Forms from "../Form";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { useEffect } from "react";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";

export const BasicMaterialFormInner = ({
  values,
  handleFieldChanged,
  showColor,
}: UseChangeHandlerResult<MaterialConfig> & {
  showColor?: boolean;
}) => {
  const classes = useStyles();

  return (
    <>
      {showColor && (
        <div className={classes.formRow}>
          <Forms.ColorPicker
            label={"color"}
            value={values.color}
            setValue={handleFieldChanged("color")}
          />
        </div>
      )}
      <div className={classes.formRow}>
        <Forms.Switch
          label="Transparent"
          value={values.transparent}
          setValue={handleFieldChanged("transparent")}
        />
      </div>
      {values.transparent && (
        <div className={classes.formRow}>
          <Forms.Slider
            label="Opacity"
            value={values.opacity || 1}
            setValue={handleFieldChanged("opacity")}
          />
        </div>
      )}
    </>
  );
};

export const BasicamaterialForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<MaterialConfig>) => {
  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const { handleFieldChanged } = changeHandlers;

  useEffect(() => {
    handleFieldChanged("materialType")("basic");
  }, [handleFieldChanged]);

  return <BasicMaterialFormInner {...changeHandlers} />;
};
export default BasicamaterialForm;
