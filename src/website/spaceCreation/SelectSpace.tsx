import { Divider, Typography } from "@material-ui/core";
import { useAuthentication } from "hooks/auth/useAuthentication";
import React from "react";
import { SpaceTemplateList } from "./SpaceTemplateList";
import { SpaceTemplateConfig } from "./types";

export const spaceTemplates: SpaceTemplateConfig[] = [
  {
    spaceId: "empty",
    title: "An Empty Space",
    description:
      "A totally blank canvas.  Drop whatever you want into this space and make it your own.",
  },
  {
    spaceId: "marble-theater",
    title: "Marble Theater",
    description: "Theater of Marble on a Mountain",
  },
];

const SelectSpace = ({
  setSelectedSpace,
  setPreviewSpace,
  creating,
}: {
  setSelectedSpace: (space: string | null) => void;
  setPreviewSpace: (space: SpaceTemplateConfig) => void;
  creating: boolean;
}) => {
  useAuthentication({
    ensureSignedInAnonymously: false,
  });

  return (
    <>
      <div className="text-center">
        <Typography variant="body1">
          Choose from one of our template or spaces or start from scratch.{" "}
        </Typography>
        <br />
        <Divider />
        <br />
        <br />
        <SpaceTemplateList
          spaceTemplates={spaceTemplates}
          onSelectSpace={setSelectedSpace}
          onPreviewSpace={setPreviewSpace}
          creating={creating}
        />
      </div>
    </>
  );
};

export default SelectSpace;
