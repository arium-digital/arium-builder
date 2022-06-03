// import Grid from "@material-ui/core/Grid/Grid";
// import { VideoConfig } from "spaceTypes";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { StandardFormPropsNullable } from "Editor/components/Form";
import React from "react";
// import { OptionalSpaceId } from "components/InSpaceEditor/types";
import Grid from "@material-ui/core/Grid/Grid";
import { LightConfig, PointLightConfig } from "spaceTypes";
import {
  isPointLight,
  isSpotLight,
  isDirectionalLight,
  LightSettingsForm,
} from "Editor/components/Elements/Light/LightForm";
import FormSection from "Editor/components/Form/FormSection";
import DirectionalLightForm from "Editor/components/Elements/Light/DirectionalLightForm";
import {
  defaultDirectionalConfig,
  defaultSpotLightConfig,
} from "defaultConfigs";
import SpotLightForm from "Editor/components/Elements/Light/SpotLightForm";
import PointLightForm from "Editor/components/Elements/Light/PointLightForm";
import * as Forms from "Editor/components/Form";

const SimplifiedLightForm = ({
  nestedForm,
  defaults: defaultValues,
  refresh,
}: StandardFormPropsNullable<LightConfig>) => {
  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const { values, makeNestedFormProps } = changeHandlers;

  if (refresh) return null;

  return (
    <Grid container>
      <Grid item xs={12}>
        <LightSettingsForm {...changeHandlers} />
      </Grid>
      {isDirectionalLight(values) && (
        <Grid item xs={12}>
          <FormSection title="Directional Light Settings" defaultExpanded>
            <DirectionalLightForm
              nestedForm={makeNestedFormProps("directional")}
              defaults={defaultDirectionalConfig}
            />
          </FormSection>
        </Grid>
      )}
      {isSpotLight(values) && (
        <>
          <FormSection title="Spot Light Settings" defaultExpanded>
            <Grid item xs={12}>
              <DirectionalLightForm
                nestedForm={makeNestedFormProps("directional")}
                defaults={defaultDirectionalConfig}
              />
            </Grid>
            <Grid item xs={12}>
              <SpotLightForm
                nestedForm={makeNestedFormProps("spot")}
                defaults={defaultSpotLightConfig}
              />
            </Grid>
          </FormSection>
        </>
      )}
      {isPointLight(values) && (
        <Grid item xs={12}>
          <FormSection title="Point Light Settings" defaultExpanded>
            <PointLightForm
              nestedForm={nestedForm as Forms.NestedFormProp<PointLightConfig>}
              defaults={defaultValues as () => PointLightConfig}
            />
          </FormSection>
        </Grid>
      )}
    </Grid>
  );
};

export default SimplifiedLightForm;
