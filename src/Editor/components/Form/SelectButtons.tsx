import ButtonGroup from "@material-ui/core/ButtonGroup/ButtonGroup";
import Button from "@material-ui/core/Button/Button";
import LabelWithTooltip from "./LabelWithTooltip";
import { EditorPropsBase } from "Editor/types";
import { useEditingElementStatus } from "./useEditingElementState";
import Grid from "@material-ui/core/Grid";
import { useTheme as useMaterialTheme } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const SelectButtons = <T extends string | number>({
  options,
  value,
  setValue,
  disabled,
  label,
  description,
}: {
  options: T[];
  disabled?: boolean;
  label?: string;
  description?: string;
} & EditorPropsBase<T>) => {
  const { locked } = useEditingElementStatus();
  const theme = useMaterialTheme() as Theme;
  return (
    <Grid container style={{ marginTop: theme.spacing(2) }}>
      <Grid item xs={12}>
        {" "}
        {label && <LabelWithTooltip label={label} toolTip={description} />}
      </Grid>
      <Grid item xs={12}>
        <ButtonGroup color="primary" aria-label="outlined primary button group">
          {options.map((option, i) => (
            <Button
              key={i}
              variant={option === value ? "contained" : "outlined"}
              onClick={() => setValue(option)}
              disabled={(disabled && option !== value) || locked}
            >
              {option}
            </Button>
          ))}
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};

export default SelectButtons;
