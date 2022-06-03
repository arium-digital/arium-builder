import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../../Form";
import FormSection, {
  FormSectionDisplaySettings,
} from "Editor/components/Form/FormSection";
import { Editors, FormDescription } from "Editor/types";
import useFormFields from "Editor/hooks/useFormFields";
import { AudioPlaySettings } from "spaceTypes/audio";
import * as sectionKeys from "Editor/activeEditorKeys";

const formDescription: FormDescription<
  AudioPlaySettings,
  "maxDistance" | "syncToTimeline"
> = {
  maxDistance: {
    editor: Editors.slider,
    editorConfig: {
      label: "Play when within distance (in meters)",
      description:
        "The maximum distance from the video that the user can be for it to play.",
      min: 1,
      max: 500,
    },
  },
  syncToTimeline: {
    editor: Editors.switch,
    editorConfig: {
      label: "Synchronize Audio Time across Sessions",
      description:
        "If set to true, then the time position that the video/audio is playing/the time in the media will be synchronized for all users, ensuring that they are viewing/hearing the media at the same point in its timeline.",
    },
  },
};

const AudioPlaySettingsForm = (
  formProps: Forms.StandardFormPropsNullable<AudioPlaySettings> &
    FormSectionDisplaySettings
) => {
  const {
    values,
    handleFieldChanged,
    // makeNestedFormProps,
    // errors,
  } = useNullableChangeHandlersWithDefaults({
    defaultValues: formProps.defaults,
    nestedForm: formProps.nestedForm,
  });
  // const classes = useStyles();

  const { FormFields, props } = useFormFields(
    formDescription,
    handleFieldChanged,
    values
  );

  const {
    title = "Advanced Audio Playback Settings",
    defaultExpanded,
    notExpandable,
  } = formProps;

  return (
    <FormSection
      {...{ title, defaultExpanded, notExpandable }}
      activeEditorKey={sectionKeys.PLAY_SETTINGS}
    >
      <FormFields.maxDistance {...props} />
      <FormFields.syncToTimeline {...props} />
    </FormSection>
  );
};

export default AudioPlaySettingsForm;
