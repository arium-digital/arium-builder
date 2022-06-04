import { Button, Grid, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { AriumOrange } from "website/themes/lightTheme";
import { IconBetaSignUp } from "website/home/utils";
import styles from "./styles.module.scss";
import { CombinedSpaceInfo } from "./types";
import { editModeQueryParamKey } from "Space/InSpaceEditor/hooks/useEditorState";
import SpaceUrlForm from "Editor/components/SpaceSettings/SpaceUrlForm";
import { ariumBlack } from "css/styleVariables";
import Link from "next/link";

export const extractText = (htmlString: string): string =>
  htmlString.replace(/<[^>]+>/g, "");
export const placeHolderImageUrl =
  "https://dummyimage.com/480x270/eee/aaa.png&text=Image+not+found";

export const addASpaceUrl =
  "https://dummyimage.com/480x270/eee/aaa.png&text=Create+a+Space";

export const dummyUrl = "https://dummyimage.com/480x270/eee/aaa.png&text=%2B";

export const AddSpaceCard = ({ showText }: { showText: boolean }) => {
  return (
    <Grid
      className={styles.cardContainer}
      container
      spacing={2}
      alignItems="flex-start"
      justify="space-between"
    >
      <Grid item xs={12} sm={5} className={styles.metaImage}>
        {showText && (
          <Link href={"/spaces/new"}>
            <img
              src={showText ? addASpaceUrl : dummyUrl}
              alt="Create a space"
              style={{ cursor: "pointer" }}
            />
          </Link>
        )}

        {!showText && (
          <img src={showText ? addASpaceUrl : dummyUrl} alt="Create a space" />
        )}
      </Grid>
    </Grid>
  );
};

export const SpaceInfoCard = ({ space }: { space: CombinedSpaceInfo }) => {
  const nameOrId = space.name || space.slug || space.id;

  const [updatingSlug, setUpdatingSlug] = useState(false);

  return (
    <>
      <Grid
        className={styles.cardContainer}
        container
        spacing={2}
        alignItems="flex-start"
        justify="space-between"
      >
        <Grid item xs={12} sm={5} className={styles.metaImage}>
          <img
            src={space.metaImageUrl || placeHolderImageUrl}
            alt={`Preview of space ${nameOrId}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} container direction="column">
          <Grid item>
            <Typography className={styles.titleText}>{nameOrId}</Typography>
          </Grid>
          <Grid item style={{ paddingBottom: 8 }}>
            <Typography variant="body1">
              <SpaceUrlForm
                spaceId={space.id}
                initialSlug={space.slug || space.id}
                setUpdating={setUpdatingSlug}
              />
            </Typography>
          </Grid>

          {space.welcomeHTML && (
            <Grid item>
              <Typography variant="body1" className={styles.bodyText}>
                {extractText(space.welcomeHTML)}
              </Typography>
            </Grid>
          )}
          <Grid item>
            <Button
              size="small"
              color={"primary"}
              disabled={updatingSlug}
              href={`/spaces/${
                space.slug || space.id
              }/?${editModeQueryParamKey}=true`}
            >
              <IconBetaSignUp color={AriumOrange} />
              {`Enter ${nameOrId}`}
            </Button>
          </Grid>
          <Grid item>
            <Button
              size="small"
              disabled={updatingSlug}
              href={`/editor/${space.slug || space.id}/space-settings`}
            >
              <IconBetaSignUp />
              <span
                style={{ color: ariumBlack, opacity: updatingSlug ? 0.3 : 1 }}
              >
                settings
              </span>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
