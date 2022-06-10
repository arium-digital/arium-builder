import React, { useMemo } from "react";
import { useStyles } from "../../styles";
import Paper from "@material-ui/core/Paper";
import { useChangeHandlers } from "../Form/helpers";
import { themeDocument } from "../../../shared/documentPaths";
import { ThemeSchema } from "../../formAndSchema";
import * as Forms from "../Form";
import * as Text from "../VisualElements/Text";
import Grid from "@material-ui/core/Grid";
import * as themeDefaults from "defaultConfigs/theme";
// import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { useValidateAndUpdate } from "Editor/hooks/updateAndCreate";
import { Theme } from "spaceTypes/theme";
// import { ArtworkDisplayConfig } from "spaceTypes/nftConfig";
import { HasFrameForm } from "../SharedForms/HasFrameForm";
import PlacardDisplayForm from "../InSpaceForms/PlacardDisplayForm";
import FormSection from "Editor/components/Form/FormSection";
import NftPlacardSettingsForm from "./NftPlacardSettingsForm";
import { CommonVideoSettingsForm } from "../SharedForms/Video/VideoSettingsForm";

const ThemeForm = ({ nestedForm }: Forms.StandardFormProps<Theme>) => {
  const { makeNestedFormProps } = useChangeHandlers(nestedForm);

  return (
    <Grid container>
      <Grid item xs={12} lg={6}>
        <Grid item xs={12}>
          <HasFrameForm
            nestedForm={makeNestedFormProps("frame")}
            getThemeDefault={themeDefaults.defaultFrame}
            title="Default Video and Image Frame Style"
            defaultExpanded
          />
        </Grid>
        <Grid item xs={12}>
          <FormSection title="Default Placard Style" defaultExpanded>
            <PlacardDisplayForm
              nestedForm={makeNestedFormProps("placardDisplay")}
              getThemeDefault={themeDefaults.placardDisplay}
              defaultExpanded
            />
          </FormSection>
        </Grid>
        <Grid item xs={12}>
          <FormSection title="Default Video Settings">
            <CommonVideoSettingsForm
              nestedForm={makeNestedFormProps("video")}
              getThemeDefault={themeDefaults.videoSettings}
            />
          </FormSection>
        </Grid>
        <NftPlacardSettingsForm
          nestedForm={makeNestedFormProps("nftPlacard")}
          getThemeDefault={themeDefaults.nftPlacard}
          title="Default Nft Placard Settings"
          defaultExpanded
        />
      </Grid>
    </Grid>
  );
};

const ThemeSettings = ({ spaceId }: { spaceId: string }) => {
  const documentRef = useMemo(() => themeDocument(spaceId), [spaceId]);

  const { nestedForm } = useValidateAndUpdate<Theme>({
    ref: documentRef,
    schema: ThemeSchema,
    autoSave: true,
    defaultIfMissing: themeDefaults.defaultTheme,
  });

  const classes = useStyles();

  if (!nestedForm) return null;

  return (
    <>
      <Paper className={classes.paper}>
        <Text.SectionHeader>{`Editing Theme`}</Text.SectionHeader>
      </Paper>

      <ThemeForm nestedForm={nestedForm} />
    </>
  );
};

export default ThemeSettings;
