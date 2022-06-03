import { useCallback, useMemo, useState } from "react";
import Typography from "@material-ui/core/Typography";
import Slider, { Mark } from "@material-ui/core/Slider";
import { useEditingElementStatus } from "./useEditingElementState";

const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;

const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);

const SliderRangeField = ({
  description,
  value,
  setFirstValue,
  setSecondValue,
  min = 0,
  max = 1,
  step = 0.01,
  marks,
  isAngle,
}: {
  description: string;
  value: [number, number];
  setFirstValue: (value: number) => void;
  setSecondValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  marks?: boolean | Mark[];
  isAngle?: boolean;
}) => {
  const valueToInternalValue = useCallback(
    (value: number) => {
      if (!isAngle) return value;

      return radiansToDegrees(value);
    },
    [isAngle]
  );

  const internalValueToValue = useCallback(
    (newValue: number) => {
      if (!isAngle) return newValue;

      return degreesToRadians(newValue);
    },
    [isAngle]
  );

  const [internalValues, setInternalValues] = useState<[number, number]>([
    valueToInternalValue(value[0]),
    valueToInternalValue(value[1]),
  ]);
  const marksToShow = useMemo((): Mark[] | boolean => {
    if (marks) return marks;
    return [
      { value: min, label: `${min}` },

      { value: max, label: `${max}` },
    ];
  }, [marks, min, max]);

  const handleChange = useCallback(
    (event: any, newValue: number | number[]) => {
      const newValueAsNumbers = newValue as [number, number];
      setInternalValues(newValueAsNumbers);
      // console.log(
      //   "internal value to value",
      //   newValue,
      //   internalValueToValue(newValue as number)
      // );
      setTimeout(() => {
        setFirstValue(internalValueToValue(newValueAsNumbers[0]));
        setSecondValue(internalValueToValue(newValueAsNumbers[1]));
      });
    },
    [setFirstValue, setSecondValue, internalValueToValue]
  );
  const { locked } = useEditingElementStatus();

  return (
    <>
      <Typography id="continuous-slider" gutterBottom>
        {description}
      </Typography>
      <Slider
        value={internalValues}
        onChange={handleChange}
        aria-labelledby="continuous-slider"
        min={min}
        max={max}
        step={step}
        valueLabelDisplay="auto"
        marks={marksToShow}
        disabled={locked}
      />
    </>
  );
};

export default SliderRangeField;
