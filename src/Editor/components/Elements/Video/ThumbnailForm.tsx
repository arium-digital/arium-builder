import Grid from "@material-ui/core/Grid/Grid";
import { useThemeableChangeHandlers } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../../Form";
import {
  LiveStreamConfig,
  VideoThumbnailConfig,
  VideoType,
} from "spaceTypes/video";
import { Skeleton } from "@material-ui/lab";
import { useCallback, useMemo, useState } from "react";
import { FileLocation } from "spaceTypes";
import { useEffect } from "react";
import { videoThumbnailUrl } from "components/Elements/Video/videoUtils";
import FormSection, {
  FormSectionDisplaySettings,
} from "Editor/components/Form/FormSection";
import { Optional } from "types";

const ThumbnailForm = ({
  storedVideo,
  videoType,
  liveStream,
  title,
  defaultExpanded,
  notExpandable,
  ...props
}: Forms.StandardFormPropsThemable<VideoThumbnailConfig> & {
  storedVideo: Optional<FileLocation>;
  liveStream?: LiveStreamConfig;
  videoType: VideoType;
} & FormSectionDisplaySettings) => {
  const { values, handleFieldChanged } = useThemeableChangeHandlers(props);

  const thumbnailUrl = useMemo(
    () =>
      videoThumbnailUrl({
        type: videoType,
        thumbnailConfig: values,
        storedVideo,
        liveStream,
      }),
    [liveStream, storedVideo, values, videoType]
  );

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [thumbnailUrl]);

  const handleLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <FormSection {...{ title, defaultExpanded, notExpandable }}>
      <Grid container>
        <Grid item xs={6}>
          <Forms.Number
            label="Time (in seconds)"
            setValue={handleFieldChanged("time")}
            initialValue={values.time}
            description="The time, in seconds, of the video to grab a thumbnail from."
            size="xl"
            min={0}
          />
        </Grid>
      </Grid>
      <Grid container>
        <div
          style={{
            maxWidth: "100%",
            maxHeight: 300,
            height: 300,
            position: "relative",
          }}
        >
          {!loaded && (
            <Skeleton width={300} height={300} style={{ transform: "none" }} />
          )}
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              style={{
                maxHeight: 300,
                maxWidth: "100%",
                margin: "10px 0",
                display: loaded ? "block" : "none",
              }}
              onLoad={handleLoaded}
            />
          )}
        </div>
      </Grid>
    </FormSection>
  );
};

export default ThumbnailForm;
