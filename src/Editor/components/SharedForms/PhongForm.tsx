import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { PhongConfig } from "../../../spaceTypes";
import { useStyles } from "../../styles";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import SliderField from "../Form/SliderField";
import * as Forms from "../Form";
import ColorPickerField from "../Form/ColorPickerField";
import * as FileSelect from "../Files/FileSelect";

export const defaultPhong = (): PhongConfig => ({
  specularColor: "0x111111",
  shininess: 0,
  reflectivity: 0,
});

const PhongForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<PhongConfig>) => {
  const {
    values,
    handleFieldChanged: handlePhongChanged,
    errors,
  } = useNullableChangeHandlersWithDefaults({ nestedForm, defaultValues });

  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Typography variant="h6">Phong Material Settings</Typography>
      <div className={classes.formRow}>
        <ColorPickerField
          label={"Specular Color"}
          value={values.specularColor}
          setValue={handlePhongChanged("specularColor")}
        />
      </div>
      <div className={classes.formRow}>
        <SliderField
          label="Shininess"
          value={values.shininess || 0}
          setValue={handlePhongChanged("shininess")}
          max={100}
          step={0.1}
        />
      </div>
      <div className={classes.formRow}>
        <SliderField
          label="Reflectivity"
          value={values.reflectivity || 0}
          setValue={handlePhongChanged("reflectivity")}
        />
      </div>
      <div className={classes.formRow}>
        <FileSelect.Image
          fieldName="Bump Map Texture File"
          file={values.bumpMapTextureFile}
          handleChanged={handlePhongChanged("bumpMapTextureFile")}
          errors={errors?.bumpMapTextureFile}
          allowEmpty={true}
        />
      </div>
      {values.bumpMapTextureFile && (
        <SliderField
          label="Bump Map Scale"
          value={values.bumpMapScale || 1}
          setValue={handlePhongChanged("bumpMapScale")}
        />
      )}
    </Paper>
  );
};

export default PhongForm;
