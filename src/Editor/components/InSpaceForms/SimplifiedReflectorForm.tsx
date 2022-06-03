// import Grid from "@material-ui/core/Grid/Grid";
// import { VideoConfig } from "spaceTypes";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { StandardFormPropsNullable } from "Editor/components/Form";
import React from "react";
// import { OptionalSpaceId } from "components/InSpaceEditor/types";
import { SimplifiedFormBase } from "./SimplifiedFormBaseAndUtils";

import { ReflectorSurfaceConfig } from "spaceTypes/reflectorSurface";
import Grid from "@material-ui/core/Grid";
import {
  ReflectorSettingsForm,
  ReflectorFrameForm,
} from "Editor/components/Elements/ReflectorSurfaceForm";

const SimplifiedReflectorForm = ({
  nestedForm,
  defaults: defaultValues,
  refresh,
}: StandardFormPropsNullable<ReflectorSurfaceConfig>) => {
  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  return (
    <SimplifiedFormBase tabLabels={["Reflector Settings"]} refresh={refresh}>
      <Grid container>
        <ReflectorSettingsForm {...changeHandlers} />
        <ReflectorFrameForm {...changeHandlers} />
      </Grid>
      <></>
    </SimplifiedFormBase>
  );
};

export default SimplifiedReflectorForm;
