import {
  useConfigOrDefaultRecursive,
  useConfigOrDefaultRecursiveConcrete,
  useThemeOrDefault,
} from "hooks/spaceHooks";
import { useCallback, useEffect, useState } from "react";
import {
  NestedFormProp,
  NestedFormPropConcrete,
  NestedOrUndefinedFormProp,
  StandardFormPropsThemable,
} from "../components/Form";
import {
  UseChangeHandlerResult,
  UseChangeHandlerResultConcrete,
  useChangeHandlers,
  useChangeHandlersConcrete,
  useNestedFormProps,
} from "./useChangeHandlers";

export function useMakeNestedFormChangeHandlers<T>({
  nestedForm,
}: {
  nestedForm: NestedFormProp<T | undefined>;
}) {
  const {
    values,
    handleUpdate,
    handleUpdates,
    path,
    errors,
    sourceValues,
  } = nestedForm;

  const nonNullNestedProps: NestedOrUndefinedFormProp<T> = {
    handleUpdate,
    handleUpdates,
    path,
    values,
    sourceValues,
    errors,
  };

  return useNestedFormProps(nonNullNestedProps);
}

export function useNullableChangeHandlersWithDefaults<T>({
  nestedForm,
  defaultValues,
}: {
  nestedForm: NestedFormProp<T | undefined>;
  defaultValues: () => T;
}): UseChangeHandlerResult<T> {
  const {
    values: existingValues,
    handleUpdate,
    handleUpdates,
    path,
    errors,
    sourceValues,
  } = nestedForm;

  const [updatedWithDefaults, setUpdatedWithDefaults] = useState(false);

  const valuesWithDefaultApplied = useConfigOrDefaultRecursive(
    existingValues,
    defaultValues
  );

  useEffect(() => {
    if (updatedWithDefaults || existingValues) return;

    const updates = {
      [path as string]: valuesWithDefaultApplied,
    };

    handleUpdates(updates);

    setUpdatedWithDefaults(true);
  }, [
    updatedWithDefaults,
    existingValues,
    defaultValues,
    valuesWithDefaultApplied,
    path,
    handleUpdates,
  ]);

  const nonNullNestedProps: NestedFormProp<T> = {
    handleUpdate,
    handleUpdates,
    path,
    values: valuesWithDefaultApplied,
    sourceValues,
    errors,
  };

  return useChangeHandlers<T>(nonNullNestedProps);
}

export const useThemeableChangeHandlers = <T>({
  nestedForm,
  getThemeDefault,
}: StandardFormPropsThemable<T>): UseChangeHandlerResultConcrete<T> => {
  const themeDefaults = useThemeOrDefault(getThemeDefault);

  const defaultValues = useCallback(() => themeDefaults, [themeDefaults]);

  const {
    values: existingValues,
    handleUpdate,
    handleUpdates,
    path,
    errors,
    sourceValues,
  } = nestedForm;

  const [updatedWithDefaults, setUpdatedWithDefaults] = useState(false);

  const valuesWithDefaultApplied = useConfigOrDefaultRecursiveConcrete(
    existingValues,
    defaultValues
  );

  useEffect(() => {
    if (updatedWithDefaults || existingValues) return;

    const updates = {
      [path as string]: valuesWithDefaultApplied,
    };

    handleUpdates(updates);

    setUpdatedWithDefaults(true);
  }, [
    updatedWithDefaults,
    existingValues,
    defaultValues,
    valuesWithDefaultApplied,
    path,
    handleUpdates,
  ]);

  const nonNullNestedProps: NestedFormPropConcrete<T> = {
    handleUpdate,
    handleUpdates,
    path,
    values: valuesWithDefaultApplied,
    sourceValues,
    errors,
  };

  return useChangeHandlersConcrete<T>(nonNullNestedProps);
};
