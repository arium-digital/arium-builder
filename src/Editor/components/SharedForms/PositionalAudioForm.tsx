import { PositionalAudioConfig } from "../../../spaceTypes";
import * as Forms from "../Form";
import FormSection, {
  FormSectionDisplaySettings,
} from "Editor/components/Form/FormSection";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { Editors, FormDescription } from "Editor/types";
import useFormFields from "Editor/hooks/useFormFields";
import { VolumeDown, VolumeUp } from "@material-ui/icons";
import * as sectionKeys from "Editor/activeEditorKeys";

const formDescription: FormDescription<
  PositionalAudioConfig,
  "mode" | "volume" | "refDistance" | "rollOffFactor" // //| "maxDistance"
> = {
  mode: {
    editor: Editors.select,
    editorConfig: {
      label: "Audio Mode",
      description:
        "If set to spatial, audio will emit from position of audio element, and get quiter as the user gets farther away.  If global is selected, the volume is constant throughout the space.",
      options: ["spatial", "global"],
    },
  },
  volume: {
    editor: Editors.slider,
    editorConfig: {
      min: 0,
      max: 100,
      valueLabelDisplay: "off",
      label: "Base Volume",
      showMarks: false,
      edgeIcons: {
        front: <VolumeDown />,
        end: <VolumeUp />,
      },
    },
  },
  refDistance: {
    editor: Editors.slider,
    editorConfig: {
      label: "Distance until audio rolls off",
      description:
        "The distance in meters from the audio source before the volume starts fading out",
      min: 1,
      max: 100,
    },
  },
  rollOffFactor: {
    editor: Editors.slider,
    editorConfig: {
      label: "Audio rolloff factor",
      description:
        "How fast the audio levels fade out when the user is farther away than the reference distance.",
      min: 0.01,
      max: 10,
    },
  },
};

const PositionalAudioForm = ({
  title = "Positional Audio Settings",
  defaultExpanded,
  notExpandable,
  defaults,
  ...rest
}: Forms.StandardFormPropsNullable<PositionalAudioConfig> &
  FormSectionDisplaySettings) => {
  const { values, handleFieldChanged } = useNullableChangeHandlersWithDefaults({
    nestedForm: rest.nestedForm,
    defaultValues: defaults,
  });

  const { FormFields, props } = useFormFields(
    formDescription,
    handleFieldChanged,
    values
  );

  return (
    <FormSection {...{ title, defaultExpanded, notExpandable }}>
      <FormFields.volume {...props} />
      <FormFields.mode {...props} />
      {values.mode === "spatial" && (
        <FormSection
          title="Spatial sound settings"
          activeEditorKey={sectionKeys.SPATIAL_AUDIO_SETTINGS}
        >
          <>
            <FormFields.refDistance {...props} />
            <FormFields.rollOffFactor {...props} />
          </>
        </FormSection>
      )}
    </FormSection>
  );
};
export default PositionalAudioForm;
