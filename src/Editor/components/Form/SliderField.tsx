import { useCallback, useMemo, useState, ReactNode } from "react";
import Slider, { Mark } from "@material-ui/core/Slider";
import LabelWithTooltip from "./LabelWithTooltip";
import { useEditingElementStatus } from "./useEditingElementState";
import { useTheme as useMaterialTheme, withStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;

const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);

const useSliderValue = ({
  value,
  setValue,
  isAngle,
  exponential,
}: {
  // label?: string;
  value: number;
  setValue: (value: number) => void;
  isAngle?: boolean;
  exponential?: boolean;
}) => {
  const valueToInternalValue = useCallback(
    (value: number) => {
      if (exponential) value = Math.log(value + 1) / Math.log(2);
      if (!isAngle) return value;
      return radiansToDegrees(value);
    },
    [isAngle, exponential]
  );

  const internalValueToValue = useCallback(
    (newValue: number) => {
      if (exponential) newValue = Math.pow(2, newValue) - 1;
      if (!isAngle) return newValue;

      return degreesToRadians(newValue);
    },
    [isAngle, exponential]
  );

  const [sliderValue, setSliderValue] = useState<number>(
    valueToInternalValue(value)
  );

  const handleChange = (event: any, newValue: number | number[]) => {
    setSliderValue(newValue as number);
    setTimeout(() => setValue(internalValueToValue(newValue as number)));
  };

  return { sliderValue, handleChange };
};

const PrettoSlider = withStyles({
  root: {
    // color: '#52af77',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -12,
    marginLeft: -12,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)",
  },
  track: {
    height: 8,
    borderRadius: 4,
    marginTop: -4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
    marginTop: -4,
  },

  mark: {
    display: "none",
  },
})(Slider);

export type SliderProps = {
  description?: string;
  label: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | null;
  marks?: Mark[];
  isAngle?: boolean;
  exponential?: boolean;
  valueLabelDisplay?: "on" | "auto" | "off";
  showMarks?: boolean;
  edgeIcons?: {
    front: ReactNode;
    end: ReactNode;
  };
  /* 
  Clarification on exponential:

  ***`exponential === true` affect the meaning of min max***

  when `exponential === true`,
  min and max is not the range of the final value,
  but the range of x where finalValue = 2^x-1

  `-1` is because that `2^0 == 1`, 
  but we want to be able to get finalValue = 0 when x = 0

  Example:{min:2, max:4} => {minValue:3, maxValue:15}

  */
};

const SliderField = ({
  description,
  label,
  value,
  setValue,
  min = 0,
  max = 1,
  step = 0.01,
  marks,
  isAngle,
  exponential,
  valueLabelDisplay = "auto",
  showMarks = true,
  edgeIcons,
}: SliderProps) => {
  const marksToShow = useMemo((): Mark[] => {
    if (marks) return marks;
    if (!showMarks) return [];
    return [
      { value: min, label: `${exponential ? Math.pow(2, min) - 1 : min}` },

      { value: max, label: `${exponential ? Math.pow(2, max) - 1 : max}` },
    ];
  }, [marks, min, max, exponential, showMarks]);

  const { locked } = useEditingElementStatus();
  const theme = useMaterialTheme() as Theme;

  const { sliderValue, handleChange } = useSliderValue({
    setValue,
    value,
    exponential,
    isAngle,
  });

  const sliderContents = (
    <>
      <PrettoSlider
        value={sliderValue}
        valueLabelFormat={(v: number) => v.toFixed(2)}
        onChange={handleChange}
        aria-labelledby="continuous-slider"
        min={min}
        max={max}
        scale={(x) => (exponential ? Math.pow(2, x) - 1 : x)}
        step={step}
        valueLabelDisplay={valueLabelDisplay}
        marks={marksToShow}
        disabled={locked}
      />
    </>
  );

  if (edgeIcons) {
    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <LabelWithTooltip label={label} toolTip={description} />
        <Grid container spacing={2}>
          <Grid item>{edgeIcons?.front}</Grid>
          <Grid item xs>
            {sliderContents}
          </Grid>
          <Grid item>{edgeIcons?.end}</Grid>
        </Grid>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginTop: theme.spacing(2) }}>
        <LabelWithTooltip label={label} toolTip={description} />
        {sliderContents}
      </div>
    </>
  );
};

export default SliderField;
