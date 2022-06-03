import { useCallback, useEffect, useState, ChangeEvent } from "react";
import { FieldSize, useFieldClassForSize } from "./helpers";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";

function PasswordField({
  value,
  setValue,
  label,
  error,
  help,
  size = "md",
}: {
  value?: string | undefined;
  setValue: (value: string | undefined) => void;
  label: string;
  error?: string;
  help?: string;
  size?: FieldSize;
}) {
  const [storedValue, setStoredValue] = useState(value);

  const [valueChanged, setValueChanged] = useState(false);

  useEffect(() => {
    setStoredValue(value);
  }, [value]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValueChanged(true);
      setStoredValue(event.target.value);
    },
    [setStoredValue]
  );

  const handleBlur = useCallback(() => {
    setValue(storedValue === "" ? undefined : storedValue);
  }, [setValue, storedValue]);

  // const [formHelperText, setFormHelperText] = useState<string | undefined>(
  //   getFormHelperText({
  //     error,
  //     help,
  //   })
  // );

  // useEffect(() => {
  //   setFormHelperText(
  //     getFormHelperText({
  //       error,
  //       help,
  //     })
  //   );
  // }, [error, help]);

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const handleMouseDownPassword = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
    },
    []
  );

  const handleClick = useCallback(() => {
    // console.log("clicked");
    if (!valueChanged) {
      // clear displayed password on first click
      setStoredValue(undefined);
      setValue(undefined);
      setValueChanged(true);
    }
  }, [valueChanged, setValue]);

  const fieldClass = useFieldClassForSize(size);
  return (
    <FormControl className={fieldClass} error={!!error}>
      <InputLabel htmlFor="standard-adornment-password">{label}</InputLabel>
      <Input
        id="standard-adornment-password"
        type={showPassword ? "text" : "password"}
        value={storedValue || ""}
        onClick={handleClick}
        onChange={handleChange}
        onBlur={handleBlur}
        className={fieldClass}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        }
      />
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

export default PasswordField;
