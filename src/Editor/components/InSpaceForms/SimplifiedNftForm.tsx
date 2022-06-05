// import Grid from "@material-ui/core/Grid/Grid";
// import { VideoConfig } from "spaceTypes";
import {
  useMakeNestedFormChangeHandlers,
  useNullableChangeHandlersWithDefaults,
} from "Editor/hooks/useNullableChangeHandlers";
import { StandardFormPropsNullable } from "Editor/components/Form";
import React, { useCallback, useState } from "react";
// import { OptionalSpaceId } from "Space/InSpaceEditor/types";
import { SimplifiedFormBase } from "./SimplifiedFormBaseAndUtils";
import { NftConfig } from "spaceTypes/nftConfig";
import {
  TokenConfigForm,
  TokenPreview,
  useExtractToken,
} from "Editor/components/SharedForms/Nft/NftForm";
import { isManualEntryToken } from "Space/Elements/Nft/tokenConversion";
import VideoSettingsForm from "../SharedForms/Video/VideoSettingsForm";
import * as themeDefaults from "defaultConfigs/theme";
import { showFromConfig } from "Space/Elements/Nft/NftMediaAndPlacardDisplay";
import AdvancedNftSettingsForm from "../SharedForms/Nft/AdvancedNftSettingsForm";
import { ImageSettingsForm } from "../SharedForms/ImageForm";
import { HasFrameForm } from "../SharedForms/HasFrameForm";
import * as Forms from "Editor/components/Form";
import FormSection from "../Form/FormSection";

export const SimplifiedNftForm = ({
  nestedForm,
  defaults: defaultValues,
  elementId,
  refresh,
}: StandardFormPropsNullable<NftConfig> & {
  elementId: string;
}) => {
  const inSpaceDefaults = useCallback(() => {
    const result: NftConfig = {
      ...defaultValues(),
      offsetFromBack: true,
      updateStatus: "awaitingInput",
    };

    return result;
  }, [defaultValues]);

  const changeHandlerResult = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues: inSpaceDefaults,
  });
  const { makeNestedFormProps } = changeHandlerResult;

  const [updating, setUpdating] = useState(false);

  const {
    mediaAndFileType,
    mediaShape,
    tokenMetadata,
    setMediaShape,
  } = useExtractToken(nestedForm.sourceValues);

  const displayNestedForm = makeNestedFormProps("display");

  const displayMakeNestedFormProps = useMakeNestedFormChangeHandlers({
    nestedForm: displayNestedForm,
  });

  const mediaFileType = mediaAndFileType.originalMediaFileType;

  const tokenConfigFormContents = (
    <>
      <TokenConfigForm
        {...changeHandlerResult}
        updating={updating}
        setUpdating={setUpdating}
        elementId={elementId}
      />
      {!isManualEntryToken(changeHandlerResult.values) && (
        <TokenPreview
          tokenMedia={mediaAndFileType}
          tokenTextInfo={tokenMetadata}
          loading={updating}
          shapeDetermined={setMediaShape}
        />
      )}
    </>
  );

  const advancedSettingsContents = (
    <>
      <AdvancedNftSettingsForm
        nestedForm={makeNestedFormProps("display")}
        mediaFileType={mediaAndFileType.originalMediaFileType}
        mediaFile={mediaAndFileType.inSpaceMediaFile || undefined}
        mediaShape={mediaShape}
      />
      {/* // hack for now put this in advanced tab at the bottom */}
      <FormSection defaultExpanded title="Interactable Config">
        <Forms.Switch
          value={changeHandlerResult.values.interactable}
          label="Open details model on click"
          setValue={changeHandlerResult.handleFieldChanged("interactable")}
          description="If enabled, when a user clicks on this nft element, a modal will open with details about the element and a link to the marketplace its listed on"
        />
      </FormSection>
    </>
  );
  const { showMedia } = showFromConfig(displayNestedForm.values);

  const hasFrameContents = showMedia ? (
    <HasFrameForm
      nestedForm={displayMakeNestedFormProps("mediaFrame")}
      getThemeDefault={themeDefaults.defaultFrame}
      defaultExpanded
    />
  ) : (
    <p>Media is not shown</p>
  );

  if (mediaFileType === "video" || mediaFileType === "gif") {
    return (
      <SimplifiedFormBase
        tabLabels={["Token", "Video Settings", "Frame", "Advanced Settings"]}
        refresh={refresh}
      >
        {tokenConfigFormContents}
        <>
          {showMedia ? (
            <VideoSettingsForm
              nestedForm={displayMakeNestedFormProps("video")}
              getThemeDefault={themeDefaults.videoSettings}
              mediaShape={mediaShape}
              storedVideo={mediaAndFileType.originalMediaFile}
              type={"stored video"}
            />
          ) : (
            <p>Media is not shown.</p>
          )}
        </>
        {hasFrameContents}
        {advancedSettingsContents}
      </SimplifiedFormBase>
    );
  }

  if (mediaFileType === "image") {
    return (
      <SimplifiedFormBase
        tabLabels={["Token", "Image Settings", "Frame", "Advanced Settings"]}
        refresh={refresh}
      >
        {tokenConfigFormContents}
        <>
          {showMedia ? (
            <ImageSettingsForm
              nestedForm={displayMakeNestedFormProps("image")}
              getThemeDefault={themeDefaults.getDefaultImageSettings}
              mediaShape={mediaShape}
            />
          ) : (
            <p>Image is not shown.</p>
          )}
        </>
        {hasFrameContents}
        {advancedSettingsContents}
      </SimplifiedFormBase>
    );
  }

  return (
    <SimplifiedFormBase
      tabLabels={["Token", "Advanced Settings"]}
      refresh={refresh}
    >
      {tokenConfigFormContents}
      {advancedSettingsContents}
    </SimplifiedFormBase>
  );
};
