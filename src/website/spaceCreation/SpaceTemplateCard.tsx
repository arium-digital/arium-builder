import { Grid, Button, Typography } from "@material-ui/core";
import useSpaceImage from "hooks/useSpaceImage";
import React, { useCallback } from "react";
import { placeHolderImageUrl } from "website/components/MySpaces/SpaceInfoCard";
import { IconBetaSignUp } from "website/landing/NewMarketingSite/utils";
import { SpaceTemplateConfig } from "./types";
import styles from "../components/MySpaces/styles.module.scss";
import { usePrimaryColor } from "website/themes/hooks";
import clsx from "clsx";

export const SpaceTemplateCard = ({
  spaceTemplate,
  onSelectSpace,
  // onCancelSelectSpace,
  onPreviewSpace,
  // isSelected,
  featured,
  showDetails = true,
  creating,
}: {
  spaceTemplate: SpaceTemplateConfig;
  onSelectSpace?: (spaceId: string | null) => void;
  onCancelSelectSpace?: () => void;
  onPreviewSpace?: (space: SpaceTemplateConfig) => void;
  isSelected?: boolean;
  featured?: boolean;
  showDetails?: boolean;
  creating: boolean;
}) => {
  const { spaceId, title, description } = spaceTemplate;

  const spaceImage = useSpaceImage(spaceId);

  const handlePreviewSpace = useCallback(
    (e: React.SyntheticEvent) => {
      if (!onPreviewSpace) return;
      e.preventDefault();
      onPreviewSpace(spaceTemplate);
    },
    [onPreviewSpace, spaceTemplate]
  );

  const primaryColor = usePrimaryColor();

  return (
    <>
      <Grid
        className={clsx(styles.cardContainer)}
        container
        spacing={2}
        alignItems="flex-start"
        justify="space-between"
      >
        <Grid
          item
          xs={12}
          md={featured ? 7 : 5}
          className={clsx(
            featured ? styles.metaImageFeatured : styles.metaImage,
            onPreviewSpace && styles.cursorPointerOnHover
          )}
        >
          <img
            onClick={handlePreviewSpace}
            src={spaceImage || placeHolderImageUrl}
            alt={`Preview of space ${spaceId}`}
          />
        </Grid>
        {showDetails && (
          <Grid
            item
            xs={12}
            sm={featured ? 4 : 6}
            container
            direction="column"
            alignItems="flex-start"
          >
            <Grid item>
              <Typography className={styles.titleText}>{title}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1" className={styles.bodyText}>
                {description}
              </Typography>
            </Grid>
            <Grid item>
              <Button
                size="small"
                color={"primary"}
                onClick={handlePreviewSpace}
                disabled={creating}
              >
                <IconBetaSignUp color={primaryColor} />
                {spaceId === "empty"
                  ? "Start with an empty space"
                  : `Start with a space from the ${title} template`}
              </Button>
            </Grid>
          </Grid>
        )}
      </Grid>
    </>
  );
};
