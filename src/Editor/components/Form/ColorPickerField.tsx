import FormControl from "@material-ui/core/FormControl";
import {
  Color as ColorPickerColor,
  ColorPicker,
  createColor,
} from "material-ui-color";
import { useCallback, useState } from "react";
import { Color } from "../../../spaceTypes";
import LabelWithTooltip from "./LabelWithTooltip";

interface StringKeyDict {
  [key: string]: any;
}

const fromHexString = (color: ColorPickerColor): Color => {
  return `#${color.hex}`;
};

function ColorPickerField<T extends StringKeyDict, K extends keyof T>({
  label,
  value: initialValue,
  setValue: saveToDB,
  description,
}: {
  label: string;
  description?: string;
  value?: Color;
  setValue: (color: Color) => void;
}) {
  const [color, setColor] = useState(createColor(initialValue || "white"));

  const handleChanged = useCallback(
    (color: ColorPickerColor) => {
      setColor(color);
      const colorString = fromHexString(color);
      saveToDB(colorString as T[K]);
    },
    [setColor, saveToDB]
  );

  return (
    <FormControl>
      <LabelWithTooltip label={label} toolTip={description} />
      <ColorPicker value={color} onChange={handleChanged} disableAlpha />
    </FormControl>
  );
}

export default ColorPickerField;
