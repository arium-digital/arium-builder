import { FieldSize } from "./components/Form/helpers";
import { NumberProps } from "./components/Form/NumberField";
import { SliderProps } from "./components/Form/SliderField";
import { SwitchProps } from "./components/Form/SwitchField";

export interface SpaceRole {
  editor: boolean;
}

type FiniteType = string | number | boolean | undefined;

export type FormErrors<T> = {
  [property in keyof T]?: T[property] extends undefined
    ? undefined
    : T[property] extends FiniteType
    ? string
    : FormErrors<T[property]>;
};

export enum Editors {
  freeText = "freeText",
  switch = "switch",
  slider = "slider",
  numberField = "numberField",
  colorPicker = "colorPicker",
  password = "password",
  dropdownPicker = "dropdownPicker",
  select = "select",
}

export type EditorPropsBase<T> = {
  value: T;
  setValue: (value: T) => void;
};

export type LabelAndDescription = {
  label: string;
  description?: string;
};

export type FreeTextFieldProps = LabelAndDescription & {
  help?: string;
  error?: string;
  fullWidth?: boolean;
  size?: FieldSize;
  multiline?: boolean;
};

export type SwitchFieldProps = LabelAndDescription &
  Pick<SwitchProps, "invertValue">;

export type ColorPickerProps = LabelAndDescription;

export type NumberFieldProps = LabelAndDescription &
  Pick<NumberProps, "step" | "max" | "min" | "isAngle" | "size">;

export type PasswordFieldProps = LabelAndDescription & {
  size?: FieldSize;
};

export type SliderFieldProps = LabelAndDescription &
  Pick<
    SliderProps,
    | "step"
    | "min"
    | "max"
    | "marks"
    | "isAngle"
    | "exponential"
    | "showMarks"
    | "valueLabelDisplay"
    | "edgeIcons"
  >;

export type SelectFieldProps = LabelAndDescription & {
  options: number[] | string[];
  error?: string;
};

export type FreeTextEditorConfig = {
  editor: Editors.freeText;
  editorConfig: FreeTextFieldProps;
  error?: string;
};

export type DropdownPickerProps = LabelAndDescription & {
  options: Array<string | { label: string; value: string }>;
};

export type DropdownPickerConfig = {
  editor: Editors.dropdownPicker;
  editorConfig: DropdownPickerProps;
};

export type SwitchEditorConfig = {
  editor: Editors.switch;
  editorConfig: SwitchFieldProps;
};

export type SelectEditorConfig = {
  editor: Editors.select;
  editorConfig: SelectFieldProps;
};

export type NumberEditorConfig = {
  editor: Editors.numberField;
  editorConfig: NumberFieldProps;
};

export type SliderEditorConfig = {
  editor: Editors.slider;
  editorConfig: SliderFieldProps;
};

export type ColorPickerConfig = {
  editor: Editors.colorPicker;
  editorConfig: ColorPickerProps;
};

export type PasswordConfig = {
  editor: Editors.password;
  editorConfig: PasswordFieldProps;
};

type EditorConfig =
  | DropdownPickerConfig
  | FreeTextEditorConfig
  | SwitchEditorConfig
  | NumberEditorConfig
  | SliderEditorConfig
  | ColorPickerConfig
  | PasswordConfig
  | SelectEditorConfig;

export type FormDescription<T, K extends keyof T> = Record<K, EditorConfig>;
