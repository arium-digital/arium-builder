import { useStyles } from "../../styles";
import React, { useEffect, useState } from "react";
import Paper from "@material-ui/core/Paper";
import * as Text from "../VisualElements/Text";
import SpaceMetadata from "./SpaceMetadata";
import SpaceAudio from "./SpaceAudio";
import SpaceSecurity from "./SpaceSecurity";
import SpacePhysics from "./SpacePhysics";
import { spaceDoc } from "shared/documentPaths";
import { ExperimentalAccess, SpaceSettings as SpaceConfig } from "types";
import { SpaceCameraControl } from "./SpaceCameraControl";

const useExperimentalAccess = ({ spaceId }: { spaceId: string }) => {
  const [
    experimentalAccessFromDb,
    setExperimentalAccessFromDb,
  ] = useState<ExperimentalAccess>({});

  useEffect(() => {
    const unsub = spaceDoc(spaceId).onSnapshot((snapshot) => {
      if (!snapshot.exists) return;

      const spaceData = snapshot.data() as SpaceConfig;

      setExperimentalAccessFromDb(spaceData.experimental || {});
    });

    return () => unsub();
  }, [spaceId]);

  return experimentalAccessFromDb;
};

const SpaceSettings = ({ spaceId }: { spaceId: string }) => {
  const classes = useStyles();

  const experimentalAccess = useExperimentalAccess({ spaceId });

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
