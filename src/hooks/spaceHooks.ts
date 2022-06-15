import { useContext, useEffect, useMemo, useState } from "react";
import merge from "lodash/merge";
import { GetThemeOrDefault, Theme } from "spaceTypes/theme";
import { SpaceContext } from "./useCanvasAndModalContext";
import { distinctUntilChanged, map } from "rxjs/operators";
// import { defaultTheme } from "defaultConfigs";
import { filterUndefined } from "libs/rx";
import { Optional } from "types";
import { useCurrentValueFromObservable } from "./useObservable";

export const useConfigOrDefault = <T>(
  config: Optional<T>,
  defaultCreator: () => T
): T => {
  const defaultValue = useMemo(defaultCreator, [defaultCreator]);

  if (config) return config;

  return defaultValue;
};

export type Concrete<Type> = {
  [Property in keyof Type]-?: Type[Property];
};

export type ConcreteAndChildrenConcrete<Type> = {
  [Property in keyof Type]-?: Concrete<Type[Property]>;
};
export const useConfigOrDefaultRecursiveConcrete = <T>(
  config: T | undefined,
  concreteDefaultCreator: () => Concrete<T>,
  themeDefault?: T
): Concrete<T> => {
  const result = useMemo(
    () => merge({}, concreteDefaultCreator(), themeDefault || {}, config),
    [concreteDefaultCreator, themeDefault, config]
  );

  return result;
};

export const mergeThemeAndDefault = <T>(
  getThemeDefault: GetThemeOrDefault<T>,
  theme: Theme
): Concrete<T> => {
  const { defaults, fromTheme } = getThemeDefault(theme);
  return merge({}, defaults, fromTheme || {});
};

const empty = {};
export const useThemeOrDefault = <T>(getThemeDefault: GetThemeOrDefault<T>) => {
  const theme$ = useContext(SpaceContext)?.theme$;

  const theme = useCurrentValueFromObservable(theme$, empty);

  const [themeDefault, setThemeDefault] = useState<Concrete<T>>(() =>
    mergeThemeAndDefault(getThemeDefault, theme)
  );

  useEffect(() => {
    if (!getThemeDefault) return;
    const sub = theme$
      ?.pipe(
        distinctUntilChanged(),
        map((theme) => {
          if (!theme) return undefined;
          return mergeThemeAndDefault(getThemeDefault, theme);
        }),
        filterUndefined()
      )
      .subscribe(setThemeDefault);

    return () => sub?.unsubscribe();
  }, [theme$, getThemeDefault]);

  return themeDefault;
};

export const useConfigOrDefaultRecursive = <T>(
  config: T | undefined | null,
  defaultCreator: () => T,
  converter?: (source: T | undefined | null) => T
): T => {
  const converted = converter ? converter(config) : config;
  const result = useMemo(() => merge({}, defaultCreator(), converted), [
    defaultCreator,
    converted,
  ]);

  return result;
};

export const useConfigOrThemeDefault = <T>(
  config: T | undefined | null,
  getThemeDefault: GetThemeOrDefault<T>
): Concrete<T> => {
  const themeDefault = useThemeOrDefault(getThemeDefault);

  const result = useMemo(() => merge({}, themeDefault, config), [
    themeDefault,
    config,
  ]);

  return result as Concrete<T>;
};
