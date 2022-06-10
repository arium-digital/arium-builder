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
    idealCapacity: "?",
  },
  {
    spaceId: "skylight-island",
    title: "Skylight Island",
    description: "Gallery Space with Skylights on an Island",
    idealCapacity: "5-50 people",
  },
  {
    spaceId: "home",
    title: "Outdoor Gallery",
    description: "Gallery Space with Hills to Explore and a Podium",
    idealCapacity: "5-50 people",
  },
  {
    spaceId: "gallery-models",
    title: "Gallery Models",
    description:
      "A few pre-fabricated gallery spaces to choose from. Pick a gallery, customize it, and create an art show!",
    idealCapacity: "5-50 people",
  },
  {
    spaceId: "paz-1",
    title: "Festival Dome",
    description:
      "A fantastical land to explore anchored by a dome, ideal for musical performances and presentations.",
    idealCapacity: "5-50 people",
  },
  {
    spaceId: "factory",
    title: "Warehouse",
    description: "A warehouse with a balcony.",
    idealCapacity: "20-100",
  },
  {
    spaceId: "comedy",
    title: "Comedy Club",
    description: "An intimate comedy club with a stage and mic.",
    idealCapacity: "5-15",
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
          Choose from one of our template or spaces or start from scratch. Check
          out{" "}
          <a
            href="https://docs.arium.xyz/space_setup/"
            target="_blank"
            rel="noreferrer"
          >
            our documentation
          </a>{" "}
          page for more help.
          {/* (you can customize it later) */}
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
