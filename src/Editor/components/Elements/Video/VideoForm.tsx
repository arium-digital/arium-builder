import Grid from "@material-ui/core/Grid/Grid";
import Paper from "@material-ui/core/Paper/Paper";
import { defaultLiveStreamVideoConfig } from "defaultConfigs";
import { VideoConfig } from "../../../../spaceTypes";
import { useStyles } from "../../../styles";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import SelectButtons from "../../Form/SelectButtons";
import LiveStreamForm from "./LiveStreamForm";
import * as FileSelect from "../../Files/FileSelect";
import * as Forms from "../../Form";
import * as Previews from "../../Form/Previews";
import * as Text from "../../VisualElements/Text";
import FormSection, {
  FormSectionDisplaySettings,
} from "Editor/components/Form/FormSection";
import { InteractableElementForm } from "../ModelForm";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import VideoSettingsForm from "./VideoSettingsForm";
import * as themeDefaults from "defaultConfigs/theme";
import { HasFrameForm } from "../FrameForm";

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

const VideoForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<VideoConfig>) => {
  const useChangeHandlerResult = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const { values } = useChangeHandlerResult;

  const classes = useStyles();

  return (
    <Grid container>
      <Grid item xs={12} lg={6}>
        <VideoContentForm {...useChangeHandlerResult} allowToggleStream />
        <HasFrameForm
          nestedForm={useChangeHandlerResult.makeNestedFormProps("frame")}
          getThemeDefault={themeDefaults.defaultFrame}
        />
        <VideoSettingsForm
          nestedForm={useChangeHandlerResult.makeNestedFormProps("settings")}
          getThemeDefault={themeDefaults.videoSettings}
          mediaShape={values.videoShape}
          liveStream={values.liveStream}
          storedVideo={values.storedVideo}
          type={values.type}
        />
        {/* <PlaySettingsForm
          nestedForm={makeNestedFormProps("playSettings")}
          defaults={defaultPlaySettings}
        />
        {!values.playSettings?.auto && (
          <ThumbnailForm
            title={"Video Thumbnail (shown when video is not playing)"}
            videoType={values.type}
            liveStream={values.liveStream}
            storedVideo={values.storedVideo}
            nestedForm={makeNestedFormProps("thumbnailConfig")}
            defaults={defaultVideoThumbnailConfig}
          />
        )}
        <PositionalAudioForm
          nestedForm={makeNestedFormProps("sound")}
          defaults={defaultVideoSoundConfig}
        /> */}
        {/* <FormSection title="Appearance">
          <Forms.Switch
            label="Has a Frame"
            value={values.hasFrame || false}
            setValue={handleFieldChanged("hasFrame")}
          />
          {values.hasFrame && (
            <FrameForm
              nestedForm={makeNestedFormProps("frameConfig")}
              defaults={defaultFrameConfig}
            />
          )}
        </FormSection> */}
        <InteractableElementForm {...useChangeHandlerResult} />
      </Grid>
      <Grid item xs={12} lg={6}>
        <Paper className={classes.paper}>
          <Text.SubElementHeader>Video Element Preview</Text.SubElementHeader>
          <Previews.Video config={values} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default VideoForm;
