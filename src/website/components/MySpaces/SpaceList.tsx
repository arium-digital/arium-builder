import { Grid } from "@material-ui/core";
import { SpaceAccess } from "hooks/auth/useSpaceAccess";
import range from "lodash/range";
import React from "react";
import { AddSpaceCard, SpaceInfoCard } from "./SpaceInfoCard";
import { useCombinedSpaceInfo } from "./useMySpaces";

const SpaceCardGridItem = ({ spaceId }: { spaceId: string }) => {
  const space = useCombinedSpaceInfo(spaceId);
  if (!space) return null;
  return (
    <Grid item xs={12}>
      <SpaceInfoCard space={space} />
    </Grid>
  );
};

const AddSpaceCardGridItem = ({ showText }: { showText: boolean }) => {
  return (
    <Grid item xs={12}>
      <AddSpaceCard showText={showText} />
    </Grid>
  );
};

export const SpaceList = ({
  spaceAccess,
  availableSpacesToCreate,
}: {
  spaceAccess: SpaceAccess;
  availableSpacesToCreate: number;
}) => {
  const spaceIds = spaceAccess.editableSpaces;

  return (
    <>
      <Grid container spacing={8} direction="column">
        {spaceIds.map((spaceId, i) => (
          <SpaceCardGridItem key={i} spaceId={spaceId} />
        ))}
      </Grid>
      {range(0, availableSpacesToCreate).map((index) => (
        <AddSpaceCardGridItem key={index} showText={index === 0} />
      ))}
    </>
  );
};
