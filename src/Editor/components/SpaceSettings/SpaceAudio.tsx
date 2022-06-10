import { useMemo } from "react";
import { useStyles } from "../../styles";
import Paper from "@material-ui/core/Paper";
import { PositionalAudioConfig } from "../../../spaceTypes";
import { useValidateAndUpdate } from "Editor/hooks/updateAndCreate";
import { spacePositionalAudioConfigDocument } from "../../../shared/documentPaths";
import Grid from "@material-ui/core/Grid";
import PositionalAudioForm from "Editor/components/SharedForms/PositionalAudioForm";
import { defaultPositionalAudioConfig } from "defaultConfigs";

const SpaceAudioSettings = ({ spaceId }: { spaceId: string }) => {
  const documentRef = useMemo(
    () => spacePositionalAudioConfigDocument(spaceId),
    [spaceId]
  );

  const { nestedForm } = useValidateAndUpdate<PositionalAudioConfig>({
    ref: documentRef,
    schema: undefined,
    autoSave: true,
    defaultIfMissing: defaultPositionalAudioConfig,
  });

  const classes = useStyles();

  if (!nestedForm) return null;

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Paper className={classes.paper}>
        <PositionalAudioForm
          nestedForm={nestedForm}
          defaults={defaultPositionalAudioConfig}
          title={"Peer Positional Audio Settings"}
        />
      </Paper>
    </Grid>
  );
};

export default SpaceAudioSettings;
