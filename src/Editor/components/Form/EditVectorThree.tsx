import { IVector3 } from "../../../spaceTypes";
import NumberField from "./NumberField";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import Grid from "@material-ui/core/Grid";
import React, {
  ChangeEvent,
  FC,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import LabelWithTooltip from "./LabelWithTooltip";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { StandardFormPropsNullable } from ".";
export const defaultZerosVector3: IVector3 = {
  x: 0,
  y: 0,
  z: 0,
};

export const defaultOnesVector3: IVector3 = {
  x: 1,
  y: 1,
  z: 1,
};

export const makDefaultZerosVector3 = () => defaultZerosVector3;
export const makDefaultOnesVector3 = () => defaultOnesVector3;

interface IEditVectorThreeProps extends StandardFormPropsNullable<IVector3> {
  description: string;
  step: number;
  isAngle?: boolean;
  uniform?: boolean;
}

const EditVectorThree: FC<IEditVectorThreeProps> = ({
  description,
  step,
  isAngle,
  uniform: allowUniform,
  nestedForm,
  defaults: defaultValues,
}) => {
  const {
    handleFieldChanged,
    values,
    errors,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });
  const [uniform, setUniform] = useState(false);
  const handleUniformCheckboxChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) setFieldEditedWhenUniform(null);
      setUniform(e.target.checked);
    },
    [setUniform]
  );
  const { handleUpdate, path } = nestedForm;
  const handleUniformChange = useCallback(
    (newValue: number) => {
      if (!path) throw new Error("path must be defined");
      // special case - handle update multiple
      handleUpdate({
        path,
        change: {
          x: newValue,
          y: newValue,
          z: newValue,
        },
      });
    },
    [handleUpdate, path]
  );

  const uniformDisplayValueRef = useRef<number | null>(null);

  const set = useMemo(() => {
    if (uniform) {
      return {
        x: handleUniformChange,
        y: handleUniformChange,
        z: handleUniformChange,
      };
    } else {
      return {
        x: handleFieldChanged("x"),
        y: handleFieldChanged("y"),
        z: handleFieldChanged("z"),
      };
    }
  }, [uniform, handleUniformChange, handleFieldChanged]);

  const [fieldEditedWhenUniform, setFieldEditedWhenUniform] = useState<
    string | null
  >(null);

  const setEditing = useMemo(
    () => ({
      x: () => setFieldEditedWhenUniform("x"),
      y: () => setFieldEditedWhenUniform("y"),
      z: () => setFieldEditedWhenUniform("z"),
    }),
    []
  );

  const setDoneEditing = useCallback(() => setFieldEditedWhenUniform(null), []);

  const useUniform = useMemo(() => {
    if (!uniform || !fieldEditedWhenUniform) {
      return {
        x: false,
        y: false,
        z: false,
      };
    }

    return {
      x: fieldEditedWhenUniform !== "x",
      y: fieldEditedWhenUniform !== "y",
      z: fieldEditedWhenUniform !== "z",
    };
  }, [uniform, fieldEditedWhenUniform]);

  return (
    <>
      <Grid
        container
        direction="row"
        alignItems="center"
        justify="space-between"
      >
        <LabelWithTooltip label={description} />
        {allowUniform && (
          <FormControlLabel
            control={
              <Checkbox
                checked={uniform}
                onChange={handleUniformCheckboxChange}
                name="uniform"
                color="secondary"
              />
            }
            label="Uniform"
          />
        )}
      </Grid>

      <Grid container>
        <Grid item xs={4}>
          <NumberField
            isAngle={isAngle}
            initialValue={values?.x}
            setValue={set.x}
            label="x"
            error={errors?.x}
            step={step}
            setEditing={setEditing.x}
            setDoneEditing={setDoneEditing}
            uniformDisplayValueRef={uniformDisplayValueRef}
            useUniform={useUniform.x}
          />
        </Grid>
        <Grid item xs={4}>
          <NumberField
            isAngle={isAngle}
            initialValue={values?.y}
            setValue={set.y}
            label="y"
            error={errors?.y}
            step={step}
            setEditing={setEditing.y}
            setDoneEditing={setDoneEditing}
            uniformDisplayValueRef={uniformDisplayValueRef}
            useUniform={useUniform.y}
          />
        </Grid>
        <Grid item xs={4}>
          <NumberField
            isAngle={isAngle}
            initialValue={values?.z}
            setValue={set.z}
            label="z"
            error={errors?.z}
            step={step}
            setEditing={setEditing.z}
            setDoneEditing={setDoneEditing}
            uniformDisplayValueRef={uniformDisplayValueRef}
            useUniform={useUniform.z}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default EditVectorThree;
