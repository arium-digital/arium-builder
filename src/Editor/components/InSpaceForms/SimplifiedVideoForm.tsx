import { VideoConfig } from "spaceTypes";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { StandardFormPropsNullable } from "Editor/components/Form";
import React from "react";
import { SimplifiedFormBase } from "./SimplifiedFormBaseAndUtils";
import { VideoContentForm } from "Editor/components/SharedForms/Video/VideoContentForm";
import { InteractableElementForm } from "Editor/components/AdvancedEditor/ModelForm";
import VideoSettingsForm from "Editor/components/SharedForms/Video/VideoSettingsForm";
import * as themeDefaults from "defaultConfigs/theme";
import { HasFrameForm } from "Editor/components/SharedForms/HasFrameForm";

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
