import { useCallback, useEffect, useState, ChangeEvent } from "react";
import TextField from "@material-ui/core/TextField";
import { useFieldClassForSize } from "./helpers";
import clsx from "clsx";
import { useStyles } from "Editor/styles";
import FormControl from "@material-ui/core/FormControl";
import LabelWithTooltip from "./LabelWithTooltip";
import FormHelperText from "@material-ui/core/FormHelperText";
import { FreeTextFieldProps, getFormHelperText } from "./FreeTextField";

export type EditFreeTextFieldProps = FreeTextFieldProps & {
  sourceValue: string | undefined;
};

function EditToggleFreeTextField({
  value: initialValue,
  sourceValue,
  setValue,
  label,
  error,
  help,
  multiline,
  size = "md",
  disabled,
  hideLabel = false,
}: EditFreeTextFieldProps) {
  const [editing, setEditing] = useState(false);

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
    setEditing(false);
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

  const enterEditMode = useCallback(
    (e: Event) => {
      e.preventDefault();
      setStoredValue(sourceValue);
      setEditing(true);
    },
    [sourceValue]
  );

  const handleCancel = useCallback(() => {
    setEditing(false);
    setStoredValue(sourceValue);
  }, [sourceValue]);

  const handleKeyPress = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.key === "Enter") {
        handleBlur();
      }
      if (ev.key === "Escape") {
        handleCancel();
      }
    },
    [handleBlur, handleCancel]
  );

  const fieldClass = useFieldClassForSize(size);

  const classes = useStyles();

  return (
    <FormControl className={clsx(classes.fieldMargin, fieldClass)}>
      {!hideLabel && <LabelWithTooltip label={label || ""} />}
      {!editing && (
        <a
          // @ts-ignore
          onClick={enterEditMode}
          title="Edit"
          href="#"
          style={{ cursor: "pointer" }}
        >
          {sourceValue}
        </a>
      )}
      {editing && (
        <TextField
          className={fieldClass}
          error={!!error}
          id="standard-error-helper-text"
          onBlur={handleBlur}
          onChange={handleChange}
          // @ts-ignore
          onKeyPress={handleKeyPress}
          multiline={multiline}
          value={storedValue || ""}
          disabled={disabled}
        />
      )}
      {formHelperText && (
        <FormHelperText id="standard-weight-helper-text">
          {formHelperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}

export default EditToggleFreeTextField;
