import { VideoConfig } from "spaceTypes";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { StandardFormPropsNullable } from "Editor/components/Form";
import React from "react";
import { SimplifiedFormBase } from "./SimplifiedFormBaseAndUtils";
import { VideoContentForm } from "Editor/components/Elements/Video/VideoForm";
import { InteractableElementForm } from "Editor/components/Elements/ModelForm";
import VideoSettingsForm from "Editor/components/Elements/Video/VideoSettingsForm";
import * as themeDefaults from "defaultConfigs/theme";
import { HasFrameForm } from "Editor/components/Elements/FrameForm";

export const SimplifiedVideoForm = ({
  nestedForm,
  defaults: defaultValues,
  refresh,
}: StandardFormPropsNullable<VideoConfig>) => {
  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });
  const { values } = changeHandlers;

  return (
    <SimplifiedFormBase
      tabLabels={["Video", "Settings", "Frame", "Interactivity"]}
      refresh={refresh}
    >
      <VideoContentForm {...changeHandlers} notExpandable />
      <VideoSettingsForm
        nestedForm={changeHandlers.makeNestedFormProps("settings")}
        getThemeDefault={themeDefaults.videoSettings}
        mediaShape={values.videoShape}
        liveStream={values.liveStream}
        storedVideo={values.storedVideo}
        type={values.type}
      />
      <HasFrameForm
        nestedForm={changeHandlers.makeNestedFormProps("frame")}
        getThemeDefault={themeDefaults.defaultFrame}
        notExpandable
      />
      <InteractableElementForm {...changeHandlers} notExpandable />
    </SimplifiedFormBase>
  );
};
