import { VideoPlaySettings } from "../../../../spaceTypes";
import { useThemeableChangeHandlers } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../../Form";
import FormSection, {
  FormSectionDisplaySettings,
} from "Editor/components/Form/FormSection";
import { Editors, FormDescription } from "Editor/types";
import useFormFields from "Editor/hooks/useFormFields";
import * as activeEditorKeys from "Editor/activeEditorKeys";

const formDescription: FormDescription<
  VideoPlaySettings,
  "auto" | "maxDistance" | "syncToTimeline"
> = {
  auto: {
    editor: Editors.switch,
    editorConfig: {
      invertValue: true,
      label: "Only play when viewer is looking at video",
      description:
        "If the video should only be playing when the user is looking in the vicinity of the video.  It is generally recommended to leave this as true.  Leaving it as false for multiple media and video elements in a space can slow down a space.",
    },
  },
  maxDistance: {
    editor: Editors.slider,
    editorConfig: {
      label: "Only play when within distance (in meters)",
      description:
        "The maximum distance from the video that the user can be for it to play.",
      min: 10,
      max: 200,
    },
  },
  syncToTimeline: {
    editor: Editors.switch,
    editorConfig: {
      label: "Synchronize Video/Audio Time across Sessions",
      description:
        "If set to true, then the time position that the video/audio is playing/the time in the media will be synchronized for all users, ensuring that they are viewing/hearing the media at the same point in its timeline.",
    },
  },
};

const VideoPlaySettingsForm = (
  formProps: Forms.StandardFormPropsThemable<VideoPlaySettings> &
    FormSectionDisplaySettings
) => {
  const {
    values,
    handleFieldChanged,
    // makeNestedFormProps,
    // errors,
  } = useThemeableChangeHandlers(formProps);
  // const classes = useStyles();

  const { FormFields, props } = useFormFields(
    formDescription,
    handleFieldChanged,
    values
  );

  const {
    title = "Advanced Video Playback Settings",
    defaultExpanded,
    notExpandable,
  } = formProps;

  return (
    <FormSection
      {...{ title, defaultExpanded, notExpandable }}
      activeEditorKey={activeEditorKeys.PLAY_SETTINGS}
    >
      <FormFields.auto {...props} />
      {!values.auto && <FormFields.maxDistance {...props} />}
      <FormFields.syncToTimeline {...props} />
    </FormSection>
  );
};

export default VideoPlaySettingsForm;
