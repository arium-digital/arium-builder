import Grid from "@material-ui/core/Grid/Grid";
import Paper from "@material-ui/core/Paper/Paper";

import { ImageConfig } from "../../../spaceTypes";
import { useStyles } from "../../styles";
import * as FileSelect from "../Files/FileSelect";
import {
  useNullableChangeHandlersWithDefaults,
  useThemeableChangeHandlers,
} from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../Form";
import * as Text from "../VisualElements/Text";
import * as Previews from "../Form/Previews";
import {} from "defaultConfigs/theme";
import React, { useCallback, useMemo } from "react";
import FormSection, { FormSectionDisplaySettings } from "../Form/FormSection";
import { InteractableElementForm } from "./ModelForm";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import { HasFrameForm } from "./FrameForm";
import { ImageSettings } from "spaceTypes/image";
import * as themeDefaults from "defaultConfigs/theme";
import { HasInSpaceQualityConfig } from "spaceTypes/mediaDisplay";
import {
  DEFAULT_IN_SPACE_IMAGE_QUALITY,
  DEFAULT_IN_SPACE_IMAGE_RESOLUTION,
} from "defaultConfigs";
import MediaGeometryForm from "./Media/MediaGeometryForm";

export const qualityOptions = ["40", "50", "60", "80", "100"];

export const InSpaceQualityForm = ({
  mediaShape,
  title = "Image Resolution and Quality",
  defaultExpanded,
  notExpandable,
  ...props
}: Forms.StandardFormPropsThemable<HasInSpaceQualityConfig> & {
  mediaShape:
    | {
        width: number;
        height: number;
      }
    | undefined;
} & FormSectionDisplaySettings) => {
  const maxWidth = useMemo(() => {
    return mediaShape?.width;
  }, [mediaShape?.width]);

  const resolutionOptions = useMemo(() => {
    if (!maxWidth) return;
    const diff = (1920 - 1280) / 2;
    return [
      480,
      640,
      720,
      1000,
      1280,
      1280 + diff,
      1920,
      1920 + diff,
      1920 + diff * 2,
    ]
      .filter((x) => x <= maxWidth)
      .map((x) => x.toString());
  }, [maxWidth]);

  const classes = useStyles();

  const changeHandlers = useThemeableChangeHandlers(props);

  const {
    values,
    handleFieldChanged,
    //  mediaShape,
  } = changeHandlers;

  const handleResolutionOptionChanged = useCallback(
    (resolutionOption: string) => {
      handleFieldChanged("inSpaceResolution")(+resolutionOption);
    },
    [handleFieldChanged]
  );

  const handleQualityOptionChanged = useCallback(
    (option: string) => {
      handleFieldChanged("inSpaceQuality")(+option);
    },
    [handleFieldChanged]
  );

  return (
    <FormSection
      {...{
        title,
        defaultExpanded,
        notExpandable,
      }}
    >
      {resolutionOptions && (
        <>
          <div className={classes.formRow}>
            <Forms.SelectButtons
              label="In-Space Max Image Resolution (along the width of the image)"
              options={resolutionOptions}
              value={
                values.inSpaceResolution?.toString() ||
                DEFAULT_IN_SPACE_IMAGE_RESOLUTION.toString()
              }
              setValue={handleResolutionOptionChanged}
              description="Since the full image resolution is usually not seen within a space (unless a viewer is very close up), it is recommended to resize the image down before displaying it; This can significantly help with performance and load time.  This setting will set the max resolution in pixels, along the width, that the image will be displayed in the space."
            />
          </div>
          <div className={classes.formRow}>
            <Forms.SelectButtons
              label="In-Space Image Quality"
              options={qualityOptions}
              value={
                values.inSpaceQuality?.toString() ||
                DEFAULT_IN_SPACE_IMAGE_QUALITY.toString()
              }
              setValue={handleQualityOptionChanged}
              description="This will set the quality of the image displayed in the space.  Lower quality means faster load time and better performance for visitors.  Recommended value is 80."
            />
          </div>
        </>
      )}
    </FormSection>
  );
};

export const ImageContentForm = (
  props: UseChangeHandlerResult<ImageConfig> & FormSectionDisplaySettings
) => {
  const {
    values,
    handleFieldChanged,
    errors,
    defaultExpanded,
    notExpandable,
    title,
  } = props;
  const classes = useStyles();

  return (
    <Grid item xs={12}>
      <FormSection {...{ title, defaultExpanded, notExpandable }}>
        <div className={classes.formRow}>
          <FileSelect.Image
            disablePaper
            fieldName="Image File"
            file={values.imageFile}
            handleChanged={handleFieldChanged("imageFile")}
            errors={errors?.imageFile}
            allowEmpty={true}
            allowExternalFile
            shapeDetermined={handleFieldChanged("imageShape")}
          />
        </div>
        <div className={classes.formRow}>
          <Forms.Switch
            label="Transparent"
            value={values.transparent || false}
            setValue={handleFieldChanged("transparent")}
          />
        </div>
        <Forms.Switch
          label="Is Animated PNG"
          value={values.isAnimated || false}
          setValue={handleFieldChanged("isAnimated")}
        />
      </FormSection>
    </Grid>
  );
};

export const ImageSettingsForm = ({
  mediaShape,
  getThemeDefault,
  nestedForm,
  hideGeometrySettings,
}: Forms.StandardFormPropsThemable<ImageSettings> & {
  mediaShape:
    | {
        width: number;
        height: number;
      }
    | undefined;
  hideGeometrySettings?: boolean;
}) => {
  const { makeNestedFormProps } = useThemeableChangeHandlers({
    nestedForm,
    getThemeDefault,
  });

  return (
    <>
      {/* <HasFrameForm nestedForm={nestedForm} getThemeDefault={mediaFrame} /> */}
      <InSpaceQualityForm
        nestedForm={nestedForm}
        getThemeDefault={themeDefaults.imageInSpaceQuality}
        mediaShape={mediaShape}
        notExpandable
      />
      {!hideGeometrySettings && (
        <MediaGeometryForm
          nestedForm={makeNestedFormProps("geometry")}
          title="3d Image Element Geoemetry"
          notExpandable
        />
      )}
    </>
  );
};

const ImageForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<ImageConfig>) => {
  const useChangeHandlerResult = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });
  const { values } = useChangeHandlerResult;
  const classes = useStyles();

  return (
    <Grid container>
      <Grid item lg={6} xs={12}>
        <ImageContentForm
          {...useChangeHandlerResult}
          defaultExpanded
          title="Image Contents"
        />
        <HasFrameForm
          nestedForm={useChangeHandlerResult.makeNestedFormProps("frame")}
          getThemeDefault={themeDefaults.defaultFrame}
          title="Image Frame"
        />
        <ImageSettingsForm
          nestedForm={useChangeHandlerResult.makeNestedFormProps("settings")}
          getThemeDefault={themeDefaults.getDefaultImageSettings}
          mediaShape={values.imageShape}
        />
        <InteractableElementForm {...useChangeHandlerResult} />
      </Grid>
      <Grid item lg={6} xs={12}>
        <Paper className={classes.paper}>
          <Text.SubElementHeader>Image Element Preview</Text.SubElementHeader>
          <Previews.Image config={values} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ImageForm;
