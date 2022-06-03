import { useCallback, useState } from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Tooltip } from "@material-ui/core";
import { useEditingElementStatus } from "./useEditingElementState";
import Switch from "@material-ui/core/Switch";

export type SwitchProps = {
  value?: boolean;
  label: string;
  description?: string;
  setValue: (value: boolean) => void;
  invertValue?: boolean;
};

const invertIfTrue = (value: boolean, invert: boolean): boolean => {
  if (invert) return !value;
  return value;
};

export function SwitchField({
  value: initialValue,
  label,
  description,
  setValue: saveToDB,
  invertValue = false,
}: SwitchProps) {
  const [value, setValue] = useState<boolean>(
    invertIfTrue(!!initialValue, invertValue)
  );

  const handleChanged = useCallback(() => {
    setValue((prev) => {
      const newValue = !prev;
      saveToDB(invertIfTrue(newValue, invertValue));
      return newValue;
    });
  }, [saveToDB, setValue, invertValue]);

  const { locked } = useEditingElementStatus();

  return (
    <>
      <Tooltip title={description || ""} placement="right">
        <FormControlLabel
          control={
            <Switch
              checked={value}
              onChange={handleChanged}
              name={label}
              color="primary"
              disabled={locked}
            />
          }
          label={label}
        />
      </Tooltip>
    </>
  );
}

export default SwitchField;
