import * as Forms from "../../Form";
import Grid from "@material-ui/core/Grid/Grid";

import { defaultCurvedMediaGeometryConfig, defaultModel } from "defaultConfigs";
import PlayGeometryForm from "../Video/PlayGeometryForm";
import FormSection, {
  FormSectionDisplaySettings,
} from "Editor/components/Form/FormSection";
import { MediaGeometryConfig } from "spaceTypes/mediaDisplay";
import { useChangeHandlers } from "Editor/hooks/useChangeHandlers";
import CurvedPlaySurfaceForm from "../Media/CurvePlaySurfaceForm";

const MediaGeometryForm = ({
  nestedForm,
  defaultExpanded,
  notExpandable,
  title = "Play Geometry",
}: Forms.StandardFormProps<MediaGeometryConfig> &
  FormSectionDisplaySettings) => {
  const changeHandlers = useChangeHandlers(nestedForm);

  const {
    values,
    handleFieldChanged,
    makeNestedFormProps,
    //  mediaShape,
  } = changeHandlers;

  return (
    <FormSection {...{ title, defaultExpanded, notExpandable }}>
      <Grid container>
        <Forms.SelectButtons
          options={["plane", "curved", "3d geometry"]}
          // @ts-ignore
          setValue={handleFieldChanged("mediaGeometryType")}
          value={values?.mediaGeometryType || "plane"}
          label="Type of surface to play the image or video on."
        />
      </Grid>
      {values?.mediaGeometryType === "curved" && (
        <CurvedPlaySurfaceForm
          nestedForm={makeNestedFormProps("mediaGeometryCurve")}
          defaults={defaultCurvedMediaGeometryConfig}
        />
      )}
      {values?.mediaGeometryType === "3d geometry" && (
        <PlayGeometryForm
          // @ts-ignore
          nestedForm={makeNestedFormProps("mediaGeometryModel")}
          defaults={defaultModel}
        />
      )}
    </FormSection>
  );
};

export default MediaGeometryForm;
