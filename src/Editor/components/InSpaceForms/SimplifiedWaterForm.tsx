// import Grid from "@material-ui/core/Grid/Grid";
// import { VideoConfig } from "spaceTypes";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { StandardFormPropsNullable } from "Editor/components/Form";
import React from "react";
// import { OptionalSpaceId } from "Space/InSpaceEditor/types";
import { SimplifiedFormBase } from "./SimplifiedFormBaseAndUtils";
import { WaterConfig } from "spaceTypes/water";
import {
  WaterSettingsForm,
  WaterGeometryForm,
} from "Editor/components/AdvancedEditor/WaterForm";

const SimplifiedWaterForm = ({
  nestedForm,
  defaults: defaultValues,
  refresh,
}: StandardFormPropsNullable<WaterConfig>) => {
  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  return (
    <SimplifiedFormBase
      tabLabels={["Water Settings", "Water Geometry"]}
      refresh={refresh}
    >
      <WaterSettingsForm {...changeHandlers} />
      <WaterGeometryForm {...changeHandlers} />
    </SimplifiedFormBase>
  );
};

export default SimplifiedWaterForm;
