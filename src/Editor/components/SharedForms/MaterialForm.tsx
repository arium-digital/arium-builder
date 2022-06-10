import { MaterialConfig } from "../../../spaceTypes";
import { useStyles } from "../../styles";
import * as Forms from "../Form";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as Text from "../VisualElements/Text";
import * as FileSelect from "../Files/FileSelect";
import PhongForm, { defaultPhong } from "./PhongForm";
import FormSection from "Editor/components/Form/FormSection";
import { BasicMaterialFormInner } from "./BasicMaterialForm";
import Grid from "@material-ui/core/Grid/Grid";

export const MaterialForm = ({
  nestedForm,
  defaults: defaultValues,
  title = "Material",
  defaultExpanded = false,
  showColor,
}: Forms.StandardFormPropsNullable<MaterialConfig> & {
  title?: string;
  defaultExpanded?: boolean;
  showColor?: boolean;
}) => {
  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const {
    values,
    handleFieldChanged,
    makeNestedFormProps,
    errors,
  } = changeHandlers;

  const classes = useStyles();

  return (
    <Grid item xs={12}>
      <FormSection title={title} defaultExpanded={defaultExpanded}>
        <>
          <div className={classes.formRow}>
            <Forms.SelectButtons
              label="Material Type"
              options={["basic", "lambert", "phong"]}
              value={values.materialType || "lambert"}
              // @ts-ignore
              setValue={handleFieldChanged("materialType")}
            />
          </div>
          {values.materialType === "basic" && (
            <BasicMaterialFormInner {...changeHandlers} showColor={showColor} />
          )}
          {values.materialType !== "basic" && (
            <>
              <div className={classes.formRow}>
                <FileSelect.Image
                  disablePaper
                  fieldName="Texture File"
                  file={values.textureFile}
                  handleChanged={handleFieldChanged("textureFile")}
                  errors={errors?.textureFile}
                  allowEmpty={true}
                />
              </div>
              {values.textureFile && (
                <div className={classes.formRow}>
                  <Forms.Number
                    label="Texture repeat x"
                    setValue={handleFieldChanged("textureRepeatX")}
                    initialValue={values.textureRepeatX || 1}
                    error={errors?.textureRepeatX}
                    min={0.1}
                  />
                  <Forms.Number
                    label="Texture repeat y"
                    setValue={handleFieldChanged("textureRepeatY")}
                    initialValue={values.textureRepeatY || 1}
                    error={errors?.textureRepeatY}
                    min={0.1}
                  />
                  <br />
                  <Text.ElementHelperText>
                    Texture repeat x and y determines how many times the texture
                    is repeated across the surface, in directions x and y. If
                    greater than 1, it will become tiled. A larger value means
                    the texture will appear smaller on the surface.
                  </Text.ElementHelperText>
                </div>
              )}
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
          )}

          {values.materialType === "phong" && (
            <PhongForm
              nestedForm={makeNestedFormProps("phong")}
              defaults={defaultPhong}
            />
          )}
        </>
      </FormSection>
    </Grid>
  );
};
export default MaterialForm;
