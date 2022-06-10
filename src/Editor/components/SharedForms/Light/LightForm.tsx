import Grid from "@material-ui/core/Grid/Grid";
import {
  DirectionalLightConfig,
  LightConfig,
  PointLightConfig,
  SpotLightConfig,
} from "../../../../spaceTypes";
import * as Forms from "../../Form";
import SelectButtons from "../../Form/SelectButtons";
import ColorPickerField from "../../Form/ColorPickerField";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import SliderField from "../../Form/SliderField";
import DirectionalLightForm from "./DirectionalLightForm";
import SpotLightForm from "./SpotLightForm";
import { FC } from "react";
import { LightKind } from "../../../../spaceTypes/light";
import {
  defaultDirectionalConfig,
  defaultSpotLightConfig,
  DEFAULT_LIGHT_INTENSITY,
} from "defaultConfigs";
import FormSection from "../../Form/FormSection";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import PointLightForm from "./PointLightForm";

export const isDirectionalLight = (
  light: LightConfig
): light is DirectionalLightConfig =>
  (light as DirectionalLightConfig).kind === LightKind.directional;

export const isSpotLight = (light: LightConfig): light is SpotLightConfig =>
  (light as SpotLightConfig).kind === LightKind.spot;

export const isPointLight = (light: LightConfig): light is PointLightConfig =>
  (light as PointLightConfig).kind === LightKind.point;

export const LightSettingsForm = ({
  values,
  handleFieldChanged,
}: UseChangeHandlerResult<LightConfig>) => (
  <Grid item xs={12}>
    <FormSection title="Light Settings" defaultExpanded>
      <Grid container>
        <Grid item xs={12}>
          <SelectButtons
            options={["directional", "spot", "point"]}
            value={values.kind}
            label="Light Kind"
            // @ts-ignore
            setValue={handleFieldChanged("kind")}
          />
        </Grid>
        <Grid item xs={12}>
          <SliderField
            label="Intensity"
            value={values.intensity || DEFAULT_LIGHT_INTENSITY}
            setValue={handleFieldChanged("intensity")}
          />
        </Grid>
        <Grid item xs={12}>
          <ColorPickerField
            label={"color"}
            value={values.color}
            setValue={handleFieldChanged("color")}
          />
        </Grid>
      </Grid>
    </FormSection>
  </Grid>
);

const LightForm: FC<Forms.StandardFormPropsNullable<LightConfig>> = ({
  nestedForm,
  defaults: defaultValues,
}) => {
  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const {
    values,
    /*handleFieldChanged,*/ makeNestedFormProps,
  } = changeHandlers;

  return (
    <Grid container>
      <Grid item xs={12} lg={6}>
        <LightSettingsForm {...changeHandlers} />
      </Grid>
      {isDirectionalLight(values) && (
        <Grid item xs={12} lg={6}>
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
            <Grid item xs={12} lg={6}>
              <DirectionalLightForm
                nestedForm={makeNestedFormProps("directional")}
                defaults={defaultDirectionalConfig}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <SpotLightForm
                nestedForm={makeNestedFormProps("spot")}
                defaults={defaultSpotLightConfig}
              />
            </Grid>
          </FormSection>
        </>
      )}
      {isPointLight(values) && (
        <Grid item xs={12} lg={6}>
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

export default LightForm;
