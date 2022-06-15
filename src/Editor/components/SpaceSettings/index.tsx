import { useStyles } from "../../styles";
import React, { useMemo } from "react";
import Paper from "@material-ui/core/Paper";
import * as Text from "../VisualElements/Text";
import SpaceMetadata from "./SpaceMetadata";
import SpaceAudio from "./SpaceAudio";
import SpaceSecurity from "./SpaceSecurity";
import SpacePhysics from "./SpacePhysics";
import { ExperimentalAccess } from "types";
import { SpaceCameraControl } from "./SpaceCameraControl";

const useFullExperimentalAccess = () => {
  const fullAccess = useMemo((): ExperimentalAccess => {
    return {
      cameraControls: true,
      physicsControls: true,
    };
  }, []);

  return fullAccess;
};

const SpaceSettings = ({ spaceId }: { spaceId: string }) => {
  const classes = useStyles();

  const experimentalAccess = useFullExperimentalAccess();

  return (
    <>
      <Paper className={classes.paper}>
        <Text.SectionHeader>{`Space Settings`}</Text.SectionHeader>
      </Paper>

      <SpaceMetadata spaceId={spaceId} />

      <SpaceSecurity spaceId={spaceId} />

      <SpaceAudio spaceId={spaceId} />
      {experimentalAccess.physicsControls && <SpacePhysics spaceId={spaceId} />}
      {experimentalAccess.cameraControls && (
        <SpaceCameraControl spaceId={spaceId} />
      )}
    </>
  );
};

export default SpaceSettings;
