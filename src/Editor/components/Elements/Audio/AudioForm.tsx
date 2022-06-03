import Grid from "@material-ui/core/Grid/Grid";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as FileSelect from "../../Files/FileSelect";
import * as Forms from "../../Form";
import FormSection, {
  FormSectionDisplaySettings,
} from "Editor/components/Form/FormSection";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import { AudioConfig } from "spaceTypes/audio";
import PositionalAudioForm from "../PositionalAudioForm";
import {
  defaultAudioPlaySettings,
  defaultAudioPositionalAudioConfig,
} from "defaultConfigs/useDefaultNewElements";
import AudioPlaySettingsForm from "./AudioPlaySettingsForm";

export const AudioContentForm = (
  props: UseChangeHandlerResult<AudioConfig> &
    FormSectionDisplaySettings & {
      allowToggleStream?: boolean;
    }
) => {
  const {
    values,
    errors,
    handleFieldChanged,
    defaultExpanded = true,
    notExpandable,
    title = "Audio File",
    makeNestedFormProps,
  } = props;

  return (
    <>
      <FormSection {...{ title, defaultExpanded, notExpandable }}>
        <Grid container>
          <Grid item xs={12}>
            <FileSelect.Audio
              disablePaper
              fieldName="mp3 file"
              file={values.audioFile}
              handleChanged={handleFieldChanged("audioFile")}
              errors={errors?.audioFile}
              allowEmpty={true}
              extensions={["mp3"]}
              allowExternalFile
            />
          </Grid>
        </Grid>
      </FormSection>
      <PositionalAudioForm
        nestedForm={makeNestedFormProps("positionalAudio")}
        defaults={defaultAudioPositionalAudioConfig}
        defaultExpanded
      />
      <AudioPlaySettingsForm
        nestedForm={makeNestedFormProps("playSettings")}
        defaults={defaultAudioPlaySettings}
      />
    </>
  );
};

const AudioForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<AudioConfig>) => {
  const useChangeHandlerResult = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  return (
    <Grid container>
      <Grid item xs={12} lg={6}>
        <AudioContentForm {...useChangeHandlerResult} />
      </Grid>
    </Grid>
  );
};

export default AudioForm;
