import { LiveStreamConfig, PlaySettings } from "../../../../spaceTypes";
import * as Forms from "Editor/components/Form";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { LiveStreamPreview } from "Editor/components/Form/VideoPreview";

const LiveStreamForm = ({
  nestedForm,
  playSettings,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<LiveStreamConfig> & {
  playSettings?: PlaySettings;
}) => {
  const {
    values,
    handleFieldChanged,
    errors,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });
  return (
    <>
      <Forms.FreeText
        label="Mux Playback Id"
        value={values.muxPlaybackId}
        setValue={handleFieldChanged("muxPlaybackId")}
        error={errors?.muxPlaybackId}
        size="fullWidth"
        help="The public playback id of the Mux asset or live stream"
      />
      <LiveStreamPreview playSettings={playSettings} liveStream={values} />
    </>
  );
};

export default LiveStreamForm;
