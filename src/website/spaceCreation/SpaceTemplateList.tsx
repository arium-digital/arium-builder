import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { SpaceTemplateCard } from "./SpaceTemplateCard";
import { SpaceTemplateConfig } from "./types";

export const SpaceTemplateList = ({
  spaceTemplates,
  subtitle,
  onSelectSpace,
  onPreviewSpace,
  featured,
  creating,
}: {
  featured?: boolean;
  onSelectSpace: (space: string | null) => void;
  onPreviewSpace: (space: SpaceTemplateConfig) => void;
  subtitle?: string;
  spaceTemplates: SpaceTemplateConfig[];
  creating: boolean;
}) => {
  return (
    <>
      {subtitle && <Typography variant="h4">{subtitle}</Typography>}
      <Grid container spacing={8} direction="column">
        {spaceTemplates.map((spaceTemplate, i) => {
          return (
            <Grid item key={i} xs={12}>
              <SpaceTemplateCard
                featured={featured}
                spaceTemplate={spaceTemplate}
                onSelectSpace={onSelectSpace}
                onPreviewSpace={onPreviewSpace}
                creating={creating}
              />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
