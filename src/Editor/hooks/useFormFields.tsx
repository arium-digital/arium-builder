import React, { FC, useMemo } from "react";
import * as Forms from "../components/Form";
import {
  ColorPickerProps,
  EditorPropsBase,
  Editors,
  FormDescription,
  NumberFieldProps,
  SliderFieldProps,
  SwitchFieldProps,
  PasswordFieldProps,
  FormErrors,
} from "Editor/types";
import { ChangeHandler } from "./useChangeHandlers";

const SwitchFieldWithUnifiedInterface: FC<
  SwitchFieldProps & EditorPropsBase<boolean>
> = Forms.Switch;

const PasswordFieldWithUnifiedInterface: FC<
  PasswordFieldProps & EditorPropsBase<string>
  // @ts-ignore - for now. ignore this if value is undefined.  need to figure out longer term.
> = ({ size, ...props }) => <Forms.Password size={size} {...props} />;

const NumberFieldWithUnifiedInterface: FC<
  NumberFieldProps & EditorPropsBase<number>
> = ({ setValue, max, min, ...props }) => (
  <>
    <Forms.Number
      {...{
        max,
        min,
        setValue: (v?: number) => setValue(v!), // why NumberField's setValue allows undefined?
        ...props,
        initialValue: props.value,
      }}
    />
  </>
);

const ColorPickerWithUnifiedInterface: FC<
  ColorPickerProps & EditorPropsBase<string>
> = Forms.ColorPicker;

const SliderFieldWithUnifiedInterface: FC<
  SliderFieldProps & EditorPropsBase<number>
> = Forms.Slider;

const getEditor = (t: Editors): FC<any> => {
  switch (t) {
    case Editors.freeText:
      return Forms.FreeText;
    case Editors.switch:
      return SwitchFieldWithUnifiedInterface;
    case Editors.numberField:
      return NumberFieldWithUnifiedInterface;
    case Editors.slider:
      return SliderFieldWithUnifiedInterface;
    case Editors.colorPicker:
      return ColorPickerWithUnifiedInterface;
    case Editors.password:
      return PasswordFieldWithUnifiedInterface;
    case Editors.dropdownPicker:
      return Forms.DropdownSelect;
    case Editors.select:
      return Forms.SelectButtons;

    default:
      throw Error("Unsupported Editor");
  }
};

type FormFieldProps<T, K extends keyof T> = {
  values: T;
  errors: FormErrors<T> | undefined;
  handleFieldChanged: (values: K) => ChangeHandler<T, K>;
};
type KeydForms<T, K extends keyof T> = Record<
  K,
  React.FC<FormFieldProps<T, K>>
>;

export type FormFields<T, K extends keyof T> = {
  FormFields: KeydForms<T, K>;
  props: FormFieldProps<T, K>;
};

export const useFormFields = <T, K extends keyof T>(
  description: FormDescription<T, K>,
  handleFieldChanged: (values: K) => ChangeHandler<T, K>,
  values: T,
  errors?: FormErrors<T> | undefined
): FormFields<T, K> => {
  const FormFields = useMemo(() => {
    // @ts-ignore
    const _forms: KeydForms<K> = {};
    for (const key in description) {
      // const keyOfObject = key as keyof T;
      const config = description[key]!;
      const Editor = getEditor(config.editor);

      const component = <T, K extends keyof T>({
        handleFieldChanged,
        values,
        errors,
      }: FormFieldProps<T, K>) => {
        // @ts-ignore
        const value = values[key] as T[K];
        // @ts-ignore
        const setValue = handleFieldChanged(key);
        // @ts-ignore
        const error = errors ? errors[key] : undefined;

        return (
          <Editor
            {...{ ...config.editorConfig, value, setValue }}
            error={error}
          />
        );
      };

      _forms[key] = component;
    }

    return _forms;
  }, [description]);

  const props = {
    handleFieldChanged,
    values,
    errors,
  };

  return {
    FormFields,
    props,
  };
};

export default useFormFields;
