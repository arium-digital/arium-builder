import { Divider, Typography } from "@material-ui/core";
import { useAuthentication } from "hooks/auth/useAuthentication";
import React from "react";
import { SpaceTemplateList } from "./SpaceTemplateList";
import { SpaceTemplateConfig } from "./types";

export const spaceTemplates: SpaceTemplateConfig[] = [
  {
    spaceId: "empty",
    title: "",
    description:
      "Create a space from a totally blank canvas.  Drop whatever you want into this space and make it your own.",
    idealCapacity: "?",
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
        <Typography variant="body1">Create a space</Typography>
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
