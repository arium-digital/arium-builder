import { ChangeEvent, FC, useMemo, useState } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import FormHelperText from "@material-ui/core/FormHelperText";
import { useStyles } from "../../styles";
import LableWithTooltip from "./LabelWithTooltip";
import { FieldSize, useFieldClassForSize } from "./helpers";
import { useEditingElementStatus } from "./useEditingElementState";

interface DropdownSelectProps {
  label: string;
  setValue: (updated: string) => void;
  value: string;
  error?: string;
  options: Array<string | { label: string; value: string }>;
  size?: FieldSize;
  description?: string;
  disabled?: boolean;
}

const DropdownSelect: FC<DropdownSelectProps> = ({
  label,
  description,
  setValue: handleChanged,
  value: initialValue,
  options,
  size = "lg",
  error,
  disabled,
}) => {
  // @ts-ignore
  const classes = useStyles();
  const [value, setValue] = useState(initialValue);

  const handleSelectChanged = (event: ChangeEvent<{ value: unknown }>) => {
    if (typeof event.target.value === "string")
      handleChanged(event.target.value);
    setValue(event.target.value as string);
  };

  const fieldClass = useFieldClassForSize(size);
  const { locked } = useEditingElementStatus();

  const dropDownOptions = useMemo(
    () =>
      options.map((option) => {
        if (typeof option === "string") return [option, option];

        return [option.value, option.label];
      }),
    [options]
  );

  return (
    <FormControl className={classes.formControlLarge} error={!!error}>
      <LableWithTooltip label={label} toolTip={description} />
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={value}
        onChange={handleSelectChanged}
        className={fieldClass}
        disabled={disabled || locked}
      >
        {dropDownOptions.map(([value, label]) => (
          <MenuItem value={value} key={value}>
            {label}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default DropdownSelect;
