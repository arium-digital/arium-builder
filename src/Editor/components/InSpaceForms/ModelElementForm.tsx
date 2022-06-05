// import Grid from "@material-ui/core/Grid/Grid";
// import { VideoConfig } from "spaceTypes";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { StandardFormPropsNullable } from "Editor/components/Form";
import React from "react";
// import { OptionalSpaceId } from "Space/InSpaceEditor/types";
import { SimplifiedFormBase } from "./ElementFormBaseAndUtils";
import { ModelConfig } from "spaceTypes";
import {
  MaterialFormSection,
  ModelAppearanceForm,
  ModelContentForm,
  InteractableElementForm,
} from "Editor/components/SharedForms/ModelForms";

const SimplifiedModelForm = ({
  nestedForm,
  defaults: defaultValues,
  refresh,
}: StandardFormPropsNullable<ModelConfig>) => {
  const changeHandlerResult = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  return (
    <SimplifiedFormBase
      tabLabels={[
        "Model and Animation",
        "Interactivity",
        "Material",
        "Other Settings",
      ]}
      refresh={refresh}
    >
      <ModelContentForm {...changeHandlerResult} />
      <InteractableElementForm {...changeHandlerResult} defaultExpanded />
      <MaterialFormSection {...changeHandlerResult} />
      <ModelAppearanceForm {...changeHandlerResult} />
    </SimplifiedFormBase>
  );
};

export default SimplifiedModelForm;
