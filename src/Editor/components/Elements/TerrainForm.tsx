import { useStyles } from "../../styles";
import Paper from "@material-ui/core/Paper";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../Form";
import Grid from "@material-ui/core/Grid/Grid";
import { FormDescription, Editors } from "../../types";
import { TerrainConfig } from "spaceTypes/terrain";
import useFormFields from "Editor/hooks/useFormFields";
import * as FileSelect from "../Files/FileSelect";
import MaterialForm from "./MaterialForm";
import { defaultMaterialConfig } from "defaultConfigs";
import ElementPreview from "../Form/ElementPreview";
import GeneratedTerrain from "components/Elements/GeneratedTerrain";
import { useState } from "react";
import FormSection from "Editor/components/Form/FormSection";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";

const terrainFormDescription: FormDescription<
  TerrainConfig,
  | "maxHeight"
  | "width"
  | "height"
  | "easing"
  | "widthSegments"
  | "heightSegments"
  | "isGround"
> = {
  maxHeight: {
    editor: Editors.numberField,
    editorConfig: {
      min: 1,
      label: "Max Height",
      description: "The maximum height of the terrain",
    },
  },
  width: {
    editor: Editors.numberField,
    editorConfig: {
      min: 1,
      label: "Width",
      description: "The width of the terrain, in meters.",
    },
  },
  height: {
    editor: Editors.numberField,
    editorConfig: {
      min: 0,
      label: "Height",
      description: "The height of the terrain, in meters.",
    },
  },
  heightSegments: {
    editor: Editors.numberField,
    editorConfig: {
      min: 0,
      label: "Height Segments",
      description: "The resolution width, in pixels, of the terrain.",
    },
  },
  widthSegments: {
    editor: Editors.numberField,
    editorConfig: {
      min: 0,
      label: "Height Segments",
      description: "The resolution height, in pixels, of the terrain.",
    },
  },
  easing: {
    editor: Editors.dropdownPicker,
    editorConfig: {
      options: [
        "Linear",
        "EaseIn",
        "EaseInWeak",
        "EaseOut",
        "EaseInOut",
        "InEaseOut",
      ],
      label: "Easing function",
      description: "The easing function when smoothing the terrain",
    },
  },
  isGround: {
    editor: Editors.switch,
    editorConfig: {
      label: "Is Ground",
      description:
        "If this is a ground, then users will always be walking above this terrain.",
    },
  },
};

export const TerrainContentForm = ({
  values,
  handleFieldChanged,
}: UseChangeHandlerResult<TerrainConfig>) => {
  const { FormFields, props } = useFormFields(
    terrainFormDescription,
    handleFieldChanged,
    values
  );

  const classes = useStyles();

  return (
    <FormSection title="Terrain Settings" defaultExpanded>
      <Grid container>
        <Grid item xs={12}>
          <FileSelect.Image
            disablePaper
            fieldName="Height Map File"
            file={values.heightMapFile}
            handleChanged={handleFieldChanged("heightMapFile")}
            errors={undefined}
            allowEmpty={true}
            allowExternalFile
          />
        </Grid>
      </Grid>
      <div className={classes.formRow}>
        <FormFields.width {...props} />
        <FormFields.height {...props} />
      </div>
      <div className={classes.formRow}>
        <FormFields.widthSegments {...props} />
        <FormFields.heightSegments {...props} />
      </div>
      <div className={classes.formRow}>
        <FormFields.maxHeight {...props} />
        <FormFields.easing {...props} />
      </div>
      <div className={classes.formRow}>
        <FormFields.isGround {...props} />
      </div>
    </FormSection>
  );
};

const TerrainForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<TerrainConfig>) => {
  const classes = useStyles();

  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const { values, makeNestedFormProps } = changeHandlers;

  // hack to get around isGround default to false - in future use recursive
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Grid container>
        <Grid item xs={12} lg={6}>
          <TerrainContentForm {...changeHandlers} />
          <MaterialForm
            title="Terrain Material"
            nestedForm={makeNestedFormProps("materialConfig")}
            defaults={defaultMaterialConfig}
            showColor
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper className={classes.paper}>
            {values.heightMapFile && (
              <ElementPreview
                loaded={loaded}
                environment="forest"
                preset="soft"
              >
                <GeneratedTerrain config={values} handleLoaded={setLoaded} />
              </ElementPreview>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default TerrainForm;
