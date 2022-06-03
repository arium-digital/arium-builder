import { TextConfig } from "spaceTypes/text";
import { useStyles } from "../../styles";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../Form";
import FreeTextField from "../Form/FreeTextField";
import ColorPickerField from "../Form/ColorPickerField";
import NumberField from "../Form/NumberField";
import ShadowForm, { defaultShadowConfig } from "./ShadowForm";
import { useCallback } from "react";
import { defaultTextSize } from "defaultConfigs";

const TextForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<TextConfig>) => {
  const classes = useStyles();

  const {
    values,
    handleFieldChanged,
    makeNestedFormProps,
    errors,
  } = useNullableChangeHandlersWithDefaults({ nestedForm, defaultValues });

  const scaledSize =
    (values.size || defaultTextSize) / (values.legacyFontScale || 1);

  const handleSizeChanged = useCallback(
    (size: number) => {
      const resultScaled = values.legacyFontScale
        ? size * values.legacyFontScale
        : size;
      handleFieldChanged("size")(resultScaled);
    },
    [handleFieldChanged, values.legacyFontScale]
  );

  return (
    <>
      <Paper className={classes.paper}>
        <Typography variant="h6">Text Settings</Typography>
        <div className={classes.formRoot}>
          <div className={classes.formRow}>
            <FreeTextField
              value={values.text}
              setValue={handleFieldChanged("text")}
              label="Text"
              size="fullWidth"
              error={errors?.text}
            />
          </div>
          <div className={classes.formRow}>
            <ColorPickerField
              label={"Font Color"}
              setValue={handleFieldChanged("frontColor")}
              value={values.frontColor}
            />
          </div>

          <div className={classes.formRow}>
            <NumberField
              label="Font Size"
              initialValue={scaledSize}
              setValue={handleSizeChanged}
            />
            <NumberField
              label="Depth"
              initialValue={values.height}
              setValue={handleFieldChanged("height")}
            />
          </div>
        </div>
      </Paper>
      <ShadowForm
        nestedForm={makeNestedFormProps("shadow")}
        defaults={defaultShadowConfig}
      />
    </>
  );
};

export default TextForm;
