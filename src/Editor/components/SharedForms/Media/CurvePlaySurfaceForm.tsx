import * as Forms from "../../Form";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import React from "react";
import FormSection from "Editor/components/Form/FormSection";
import { CurvedMediaGeometryConfig } from "spaceTypes/video";
import { DEFAULT_CURVE_ANGLE } from "defaultConfigs";

const CurvedPlaySurfaceForm = ({
  nestedForm,
  defaults: defaultValues,
}: Forms.StandardFormPropsNullable<CurvedMediaGeometryConfig>) => {
  const useChangeHandlerResult = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });
  const { values, handleFieldChanged } = useChangeHandlerResult;
  return (
    <FormSection title="Curv Configuration" defaultExpanded>
      <Forms.Slider
        min={5}
        max={180}
        description="Curve Angle"
        label="Curve Angle"
        value={values.curveAngle || DEFAULT_CURVE_ANGLE}
        setValue={handleFieldChanged("curveAngle")}
        step={0.1}
      />
      <Forms.SelectButtons
        options={["horizontal", "vertical"]}
        label="Orientation"
        // @ts-ignore
        setValue={handleFieldChanged("orientation")}
        // @ts-ignore
        value={values.orientation}
      />
    </FormSection>
  );
};

export default CurvedPlaySurfaceForm;
