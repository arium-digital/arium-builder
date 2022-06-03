import { StandardFormPropsNullable } from "Editor/components/Form";
import React from "react";
import Grid from "@material-ui/core/Grid/Grid";
import { ScreenShareConfig } from "spaceTypes";
import { ScreenShareContentsForm } from "Editor/components/Elements/ScreenShareForm";

const SimplifiedScreenshareForm = (
  props: StandardFormPropsNullable<ScreenShareConfig>
) => {
  if (props.refresh) return null;
  return (
    <Grid container>
      <Grid item xs={12}>
        <ScreenShareContentsForm notExpandable {...props} />
      </Grid>
    </Grid>
  );
};

export default SimplifiedScreenshareForm;
