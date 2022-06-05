// import Grid from "@material-ui/core/Grid/Grid";
// import { VideoConfig } from "spaceTypes";
import { StandardFormPropsNullable } from "Editor/components/Form";
import React from "react";
// import { OptionalSpaceId } from "Space/InSpaceEditor/types";

import { PortalConfig } from "spaceTypes/portal";
import {
  PortalSettingsForm,
  PortalTargetForm,
  ToAnotherSpaceForm,
  usePortalFields,
} from "Editor/components/AdvancedEditor/PortalForm";
import Grid from "@material-ui/core/Grid/Grid";
import { SimplifiedFormBase } from "./SimplifiedFormBaseAndUtils";

const SimplifiedPortalForm = (
  props: StandardFormPropsNullable<PortalConfig>
) => {
  const { formFieldsAndProps, values, makeNestedFormProps } = usePortalFields(
    props
  );
  return (
    <SimplifiedFormBase tabLabels={["Portal"]} refresh={props.refresh}>
      <Grid container>
        <PortalSettingsForm {...formFieldsAndProps} />

        {values.toAnotherSpace && (
          <ToAnotherSpaceForm {...formFieldsAndProps} />
        )}
        {!(values.toAnotherSpace && !values.specifyLandingPosition) && (
          <PortalTargetForm makeNestedFormProps={makeNestedFormProps} />
        )}
      </Grid>
      <></>
    </SimplifiedFormBase>
  );
};

export default SimplifiedPortalForm;
