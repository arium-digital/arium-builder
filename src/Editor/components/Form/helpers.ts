import { useMemo } from "react";
import { useStyles } from "../../styles";
import { useChangeHandlers } from "Editor/hooks/useChangeHandlers";

export { useChangeHandlers };

export function updateOrDelete<T, K extends keyof T>(
  values: T,
  prop: K,
  value?: T[K]
) {
  if (typeof value === "undefined") {
    const toUpdate = {
      ...values,
    };
    delete toUpdate[prop];

    return toUpdate;
  }
  return {
    ...values,
    [prop]: value,
  };
}

export const buildChangedHandler = <T, K extends keyof T>(
  values: T,
  handleChanged: (newValues: T) => void
) => {
  return (prop: K) => (value?: T[K]) => {
    handleChanged(updateOrDelete(values, prop, value));
  };
};

export type AggregateResultDict = {
  [key: string]: {
    value: any;
    valid: boolean;
  };
};

export const aggregateUpdates = (
  existing: AggregateResultDict = {},
  { path, valid, value }: PartialUpdate
) => {
  return {
    ...existing,
    [path.join(".")]: {
      valid,
      value,
    },
  };
};

export interface PartialUpdate {
  path: string[];
  value: any;
  valid: boolean;
}

export type FieldSize = "sm" | "md" | "lg" | "xl" | "fullWidth";

export const useFieldClassForSize = (size: FieldSize) => {
  const classes = useStyles();

  const fieldClass = useMemo(() => {
    if (size === "sm") return classes.numberFieldSmall;
    if (size === "md") return classes.numberFieldMedium;
    if (size === "lg") return classes.numberFieldLarge;
    if (size === "xl") return classes.numberFieldExtraLarge;
    return classes.fullWidth;
  }, [size, classes]);

  return fieldClass;
};
