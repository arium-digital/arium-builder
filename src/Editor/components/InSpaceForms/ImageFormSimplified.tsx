import { ImageConfig } from "spaceTypes";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { StandardFormPropsNullable } from "Editor/components/Form";
import React from "react";
import { SimplifiedFormBase } from "./SimplifiedFormBaseAndUtils";
import {
  ImageContentForm,
  ImageSettingsForm,
} from "Editor/components/Elements/ImageForm";
import { InteractableElementForm } from "Editor/components/Elements/ModelForm";
import * as themeDefaults from "defaultConfigs/theme";
import { HasFrameForm } from "Editor/components/Elements/FrameForm";

export const SimplifiedImageForm = ({
  nestedForm,
  defaults: defaultValues,
  refresh,
}: StandardFormPropsNullable<ImageConfig>) => {
  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  return (
    <SimplifiedFormBase
      tabLabels={["Content", "Frame", "Interactivity", "Advanced"]}
      refresh={refresh}
    >
      <ImageContentForm {...changeHandlers} notExpandable />
      <HasFrameForm
        nestedForm={changeHandlers.makeNestedFormProps("frame")}
        getThemeDefault={themeDefaults.defaultFrame}
        notExpandable
      />
      <InteractableElementForm {...changeHandlers} notExpandable />
      <ImageSettingsForm
        nestedForm={changeHandlers.makeNestedFormProps("settings")}
        getThemeDefault={themeDefaults.getDefaultImageSettings}
        mediaShape={changeHandlers.values.imageShape}
      />
    </SimplifiedFormBase>
  );
};

export default SimplifiedImageForm;
