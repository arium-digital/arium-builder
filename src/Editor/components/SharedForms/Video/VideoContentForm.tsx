import Grid from "@material-ui/core/Grid/Grid";
import { defaultLiveStreamVideoConfig } from "defaultConfigs";
import { VideoConfig } from "../../../../spaceTypes";
import { useStyles } from "../../../styles";
import SelectButtons from "../../Form/SelectButtons";
import LiveStreamForm from "./LiveStreamForm";
import * as FileSelect from "../../Files/FileSelect";
import FormSection, {
  FormSectionDisplaySettings,
} from "Editor/components/Form/FormSection";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";

export const VideoContentForm = (
  props: UseChangeHandlerResult<VideoConfig> &
    FormSectionDisplaySettings & {
      allowToggleStream?: boolean;
    }
) => {
  const classes = useStyles();
  const {
    values,
    errors,
    handleFieldChanged,
    makeNestedFormProps,
    defaultExpanded = true,
    notExpandable,
    title = "Video Content",
    allowToggleStream,
  } = props;
  const videoType = values.type || "stored video";

  return (
    <FormSection {...{ title, defaultExpanded, notExpandable }}>
      <Grid container>
        {allowToggleStream && (
          <Grid item xs={12}>
            <div className={classes.formRow}>
              <SelectButtons
                options={["stored video", "stream"]}
                value={videoType}
                // @ts-ignore
                setValue={handleFieldChanged("type")}
              />
            </div>
          </Grid>
        )}
        <Grid item xs={12}>
          <div className={classes.formRow}>
            {videoType === "stored video" && (
              <FileSelect.Video
                disablePaper
                fieldName="mp4 or webm file"
                file={values.storedVideo}
                handleChanged={handleFieldChanged("storedVideo")}
                errors={errors?.storedVideo}
                allowEmpty={true}
                extensions={["mp4", "webm"]}
                allowExternalFile
              />
            )}
            {videoType === "stream" && (
              <LiveStreamForm
                nestedForm={makeNestedFormProps("liveStream")}
                defaults={defaultLiveStreamVideoConfig}
              />
            )}
          </div>
        </Grid>
      </Grid>
    </FormSection>
  );
};
