import { playSettings, videoThumbnail } from "defaultConfigs/theme";
import { VideoConfig } from "../../../../spaceTypes";

import * as Forms from "../../Form";

import PositionalAudioForm from "../PositionalAudioForm";
import ThumbnailForm from "./ThumbnailForm";
import VideoPlaySettingsForm from "./VideoPlaySettingsForm";
import { useThemeableChangeHandlers } from "Editor/hooks/useNullableChangeHandlers";
import { VideoSettings } from "spaceTypes/video";
import { defaultPositionalAudioConfig } from "defaultConfigs";
import MediaGeometryForm from "../Media/MediaGeometryForm";
import { getThumbnailDomain } from "media/mediaUrls";
import { useMemo } from "react";

export const CommonVideoSettingsForm = ({
  getThemeDefault,
  nestedForm,
}: Forms.StandardFormPropsThemable<VideoSettings> & {}) => {
  const { makeNestedFormProps } = useThemeableChangeHandlers({
    nestedForm,
    getThemeDefault,
  });

  return (
    <>
      <PositionalAudioForm
        nestedForm={makeNestedFormProps("positionalAudio")}
        defaults={defaultPositionalAudioConfig}
        defaultExpanded
        title="Video Sound Settings"
      />
      <VideoPlaySettingsForm
        nestedForm={makeNestedFormProps("playSettings")}
        getThemeDefault={playSettings}
        defaultExpanded
      />
    </>
  );
};

const VideoSettingsForm = ({
  type,
  liveStream,
  storedVideo,
  getThemeDefault,
  hideGeometrySettings,
  ...props
}: Forms.StandardFormPropsThemable<VideoSettings> & {
  mediaShape:
    | {
        width: number;
        height: number;
      }
    | undefined;
  hideGeometrySettings?: boolean;
} & Pick<VideoConfig, "storedVideo" | "liveStream" | "type">) => {
  const { makeNestedFormProps } = useThemeableChangeHandlers({
    nestedForm: props.nestedForm,
    getThemeDefault,
  });

  const { nestedForm } = props;

  const thumbnailDomain = useMemo(() => getThumbnailDomain(), []);

  return (
    <>
      <PositionalAudioForm
        nestedForm={makeNestedFormProps("positionalAudio")}
        defaults={defaultPositionalAudioConfig}
        title="Video sound settings"
        defaultExpanded
      />
      <VideoPlaySettingsForm
        nestedForm={makeNestedFormProps("playSettings")}
        getThemeDefault={playSettings}
        title="When the video should play"
      />
      {!nestedForm.values?.playSettings?.auto && thumbnailDomain && (
        <ThumbnailForm
          title={"Thumbnail (shown when video is not playing)"}
          videoType={type}
          liveStream={liveStream}
          storedVideo={storedVideo}
          nestedForm={makeNestedFormProps("videoThumbnail")}
          getThemeDefault={videoThumbnail}
        />
      )}
      {!hideGeometrySettings && (
        <MediaGeometryForm nestedForm={makeNestedFormProps("geometry")} />
      )}
    </>
  );
};

export default VideoSettingsForm;
