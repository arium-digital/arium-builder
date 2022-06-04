// import Grid from "@material-ui/core/Grid/Grid";
// import { VideoConfig } from "spaceTypes";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { StandardFormPropsNullable } from "Editor/components/Form";
import React from "react";
// import { OptionalSpaceId } from "Space/InSpaceEditor/types";
import { SimplifiedFormBase } from "./SimplifiedFormBaseAndUtils";

import { PlacardConfig } from "spaceTypes/text";
import { PlacardContentForm } from "Editor/components/Elements/PlacardForm";
import * as themeDefaults from "defaultConfigs/theme";
import PlacardDisplayForm from "Editor/components/Elements/PlacardDisplayForm";

const SimplifiedPlacardForm = ({
  nestedForm,
  defaults: defaultValues,
  refresh,
}: StandardFormPropsNullable<PlacardConfig>) => {
  const changeHandlerResult = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const { makeNestedFormProps } = changeHandlerResult;

  return (
    <SimplifiedFormBase tabLabels={["Placard", "Style"]} refresh={refresh}>
      <PlacardContentForm {...changeHandlerResult} />
      <PlacardDisplayForm
        nestedForm={makeNestedFormProps("display")}
        getThemeDefault={themeDefaults.placardDisplay}
        // defaultExpanded
      />
    </SimplifiedFormBase>
  );
};

export default SimplifiedPlacardForm;
