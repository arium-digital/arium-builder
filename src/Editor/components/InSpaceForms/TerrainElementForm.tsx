// import Grid from "@material-ui/core/Grid/Grid";
// import { VideoConfig } from "spaceTypes";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { StandardFormPropsNullable } from "Editor/components/Form";
import React from "react";
// import { OptionalSpaceId } from "Space/InSpaceEditor/types";
import { SimplifiedFormBase } from "./ElementFormBaseAndUtils";
import { TerrainConfig } from "spaceTypes/terrain";
import { defaultMaterialConfig } from "defaultConfigs";
import MaterialForm from "Editor/components/SharedForms/MaterialForm";
import { TerrainContentForm } from "Editor/components/SharedForms/TerrainForms";

const SimplifiedTerrainForm = ({
  nestedForm,
  defaults: defaultValues,
  refresh,
}: StandardFormPropsNullable<TerrainConfig>) => {
  const changeHandlerResult = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  return (
    <SimplifiedFormBase tabLabels={["Terrain", "Material"]} refresh={refresh}>
      <TerrainContentForm {...changeHandlerResult} />
      <MaterialForm
        title="Terrain Material"
        nestedForm={changeHandlerResult.makeNestedFormProps("materialConfig")}
        defaults={defaultMaterialConfig}
        defaultExpanded
        showColor
      />
    </SimplifiedFormBase>
  );
};

export default SimplifiedTerrainForm;
