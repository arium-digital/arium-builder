import { Concrete } from "hooks/spaceHooks";
import { useCallback, useMemo, useState } from "react";
import {
  NestedFormProp,
  NestedFormPropConcrete,
  NestedOrUndefinedFormProp,
  UpdateHandlers,
} from "../components/Form";
import { FormErrors } from "../types";

export type ChangeHandler<T, K extends keyof Partial<T>> = (
  value?: T[K]
) => void;

type ChangeHandlers<T> = {
  [property in keyof T]?: ChangeHandler<T, property>;
};

export type HandleFieldChanged<T> = <K extends keyof Partial<T>>(
  prop: K
) => ChangeHandler<Partial<T>, K>;

export type HandleFieldsChanged<T> = <K extends keyof T>(
  props: K[]
) => ChangeHandlers<T>;

export type UseChangeHandlerResult<T> = {
  values: T;
  handleFieldChanged: HandleFieldChanged<Partial<T>>;
  makeNestedFormProps: <K extends keyof T>(prop: K) => NestedFormProp<T[K]>;
  handleUpdates: UpdateHandlers;
  errors?: FormErrors<T>;
  sourceValues: T | undefined;
};
export type UseChangeHandlerResultConcrete<T> = {
  values: Concrete<T>;
  handleFieldChanged: HandleFieldChanged<Partial<T>>;
  makeNestedFormProps: <K extends keyof T>(
    prop: K
  ) => NestedFormProp<Concrete<T>[K]>;
  handleUpdates: UpdateHandlers;
  errors?: FormErrors<T>;
  sourceValues: T | undefined;
};

export const useNestedFormProps = <T>({
  path,
  errors,
  sourceValues,
  values: value,
  handleUpdate,
  handleUpdates,
}: NestedOrUndefinedFormProp<T>) => {
  const pathPrefix = useMemo(() => (path ? `${path}.` : ""), [path]);

  const makeNestedFormProps = useCallback(
    <K extends keyof T>(prop: K): NestedFormProp<T[K]> => {
      const nestedPath = `${pathPrefix}${prop}`;

      const nestedErrors = errors ? errors[prop] : undefined;

      const nestedFormProp: NestedFormProp<T[K]> = {
        values: !!value ? value[prop] : undefined,
        sourceValues: sourceValues ? sourceValues[prop] : undefined,
        path: nestedPath,
        handleUpdate,
        handleUpdates,
        // @ts-ignore
        errors: nestedErrors,
      };

      return nestedFormProp;
    },
    [handleUpdate, pathPrefix, value, handleUpdates, errors, sourceValues]
  );
  return makeNestedFormProps;
};

export const useHandleFieldChanged = <T>({
  path,
  handleUpdate,
}: Pick<NestedFormProp<T>, "handleUpdate" | "path">): HandleFieldChanged<
  Partial<T>
> => {
  const [changeHandlers, setChangeHandlers] = useState<ChangeHandlers<T>>({});

  const handleFieldChanged = useCallback(
    <K extends keyof T>(prop: K): ChangeHandler<Partial<T>, K> => {
      if (changeHandlers[prop])
        // @ts-ignore
        return changeHandlers[prop];

      const changeHandler = (value?: T[K]) => {
        const pathToUpdate = path ? `${path}.${prop}` : (prop as string);

        handleUpdate({ path: pathToUpdate, change: value });
      };

      setChangeHandlers((existing) => ({
        ...existing,
        [prop]: changeHandler,
      }));

      return changeHandler;
    },
    [changeHandlers, path, handleUpdate]
  );

  return handleFieldChanged;
};

export const useChangeHandlers = <T>(
  props: NestedFormProp<T>
): UseChangeHandlerResult<T> => {
  const {
    values: value,
    sourceValues,
    handleUpdate,
    handleUpdates,
    path,
    errors,
  } = props;

  const makeNestedFormProps = useNestedFormProps(props);

  const handleFieldChanged = useHandleFieldChanged({
    path,
    handleUpdate,
  });

  return {
    values: value,
    handleFieldChanged,
    makeNestedFormProps,
    handleUpdates,
    errors,
    sourceValues,
  };
};

export const useChangeHandlersConcrete = <T>(
  props: NestedFormPropConcrete<T>
): UseChangeHandlerResultConcrete<T> => {
  const {
    values: value,
    sourceValues,
    handleUpdate,
    handleUpdates,
    path,
    errors,
  } = props;

  const makeNestedFormProps = useNestedFormProps(props);

  const handleFieldChanged = useHandleFieldChanged({
    path,
    handleUpdate,
  });

  return {
    values: value,
    handleFieldChanged,
    makeNestedFormProps,
    handleUpdates,
    errors,
    sourceValues,
  };
};
