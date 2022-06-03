import { FormErrors } from "../../types";
import ColorPicker from "./ColorPickerField";
import EditVectorThree from "./EditVectorThree";
import FreeText from "./FreeTextField";
import EditToggleFreeText from "./EditToggleFreeTextField";
import ImagePreview from "./ImagePreview";
import Number from "./NumberField";
import SelectButtons from "./SelectButtons";
import Slider from "./SliderField";
import Switch from "./SwitchField";
import SliderRange from "./SliderRangeField";
import FileSelect from "../Files/FileSelect";
import RichTextEditor, { useEditorAndSaveButton } from "./RichTextEditor";
import DropdownSelect from "./DropdownSelect";
import Password from "./PasswordField";
import WithConfirmationDialog from "./WithConfirmationDialog";
import FontSelect from "./FontSelect";
import { GetThemeOrDefault } from "spaceTypes/theme";
import { Concrete } from "hooks/spaceHooks";

export interface Update {
  path: string;
  change: any;
}

export type UpdateDict = { [path: string]: any };

export type UpdateHandler = (updates: Update) => void;
export type UpdateHandlers = (updates: UpdateDict) => void;

export type NestedFormPropBase<T> = {
  path: string | null;
  handleUpdate: UpdateHandler;
  handleUpdates: UpdateHandlers;
  // todo: figure this out out:
  sourceValues: T | undefined;
  errors?: FormErrors<T>;
};

export type NestedFormProp<T> = NestedFormPropBase<T> & {
  values: T;
};

export type NestedFormPropWithUpdatedId<T> = NestedFormProp<T> & {
  updatedId: string;
};

export type NestedFormPropConcrete<T> = NestedFormPropBase<T> & {
  values: Concrete<T>;
};

export type NestedOrUndefinedFormProp<T> = NestedFormPropBase<T> & {
  // todo: figure this out out:
  values: T | undefined;
};

export interface LegacyFormProps<T> {
  config: T;
  handleChanged: (config?: T) => void;
  errors?: FormErrors<T>;
}

export interface StandardFormProps<T> {
  nestedForm: NestedFormProp<T>;
}

export interface StandardFormPropsNullable<T> {
  nestedForm: NestedFormProp<T | undefined>;
  defaults: () => T;
  refresh?: boolean;
}

export type ThemableOrDefaults<T> = {
  getThemeDefault: GetThemeOrDefault<T>;
};

export type StandardFormPropsThemable<T> = {
  nestedForm: NestedFormProp<T | undefined>;
} & ThemableOrDefaults<T>;

export interface StandardFormPropsNullable<T> {
  nestedForm: NestedFormProp<T | undefined>;
  defaults: () => T;
}

export interface StandardFormPropsNullable<T> {
  nestedForm: NestedFormProp<T | undefined>;
  defaults: () => T;
}

export {
  DropdownSelect,
  RichTextEditor,
  useEditorAndSaveButton,
  ColorPicker,
  EditVectorThree,
  FreeText,
  ImagePreview,
  Number,
  SelectButtons,
  Slider,
  Switch,
  SliderRange,
  FileSelect,
  WithConfirmationDialog,
  Password,
  FontSelect,
  EditToggleFreeText,
};
