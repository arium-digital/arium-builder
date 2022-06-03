import { useCallback, useEffect, useState, ChangeEvent } from "react";
import TextField from "@material-ui/core/TextField";
import { FieldSize, useFieldClassForSize } from "./helpers";
import clsx from "clsx";
import { useStyles } from "Editor/styles";
import FormControl from "@material-ui/core/FormControl";
import LabelWithTooltip from "./LabelWithTooltip";
import FormHelperText from "@material-ui/core/FormHelperText";
import { useEditingElementStatus } from "./useEditingElementState";

export const getFormHelperText = ({
  error,
  help,
}: {
  error?: string;
  help?: string;
}) => {
  if (error) return error;
  else if (help) return help;
  return;
};

export type FreeTextFieldProps = {
  value?: string;
  setValue: (value: string | undefined) => void;
  label?: string;
  error?: string;
  help?: string;
  multiline?: boolean;
  size?: FieldSize;
  disabled?: boolean;
  hideLabel?: boolean;
};

function FreeTextField({
  value: initialValue,
  setValue,
  label,
  error,
  help,
  multiline,
  size = "md",
  disabled,
  hideLabel = false,
}: FreeTextFieldProps) {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    setStoredValue(initialValue);
  }, [initialValue]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setStoredValue(event.target.value);
    },
    [setStoredValue]
  );

  const handleBlur = useCallback(() => {
    setValue(storedValue === "" ? undefined : storedValue);
  }, [setValue, storedValue]);

  const [formHelperText, setFormHelperText] = useState<string | undefined>(
    getFormHelperText({
      error,
      help,
    })
  );

  useEffect(() => {
    setFormHelperText(
      getFormHelperText({
        error,
        help,
      })
    );
  }, [error, help]);

  const fieldClass = useFieldClassForSize(size);

  const classes = useStyles();
  const { locked } = useEditingElementStatus();

  return (
    <FormControl className={clsx(classes.fieldMargin, fieldClass)}>
      {!hideLabel && <LabelWithTooltip label={label || ""} />}
      <TextField
        className={fieldClass}
        error={!!error}
        id="standard-error-helper-text"
        onBlur={handleBlur}
        onChange={handleChange}
        multiline={multiline}
        value={storedValue || ""}
        disabled={disabled || locked}
      />
      {formHelperText && (
        <FormHelperText id="standard-weight-helper-text">
          {formHelperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}

export default FreeTextField;
