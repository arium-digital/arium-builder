import React, { useCallback, useEffect, useState } from "react";
import Mousetrap, { ExtendedKeyboardEvent } from "mousetrap";
import { useComponentId } from "hooks/useComponentId";
import { usePrevious } from "./usePrevious";

const existingBindings: Map<string, number> = new Map();

export type KeyEventType = "keypress" | "keyup" | "keydown";

const buildKey = (key: string | string[], type?: KeyEventType): string => {
  if (!type) return `${key}`;
  return `${key} : ${type}`;
};

const mousetrap = new Mousetrap();
const escSet: Set<(e: any) => void> = new Set();
const excuteEsc = (e: any) => {
  escSet.forEach((func) => func(e));
};

const pushToEscStack = (func: (e: any) => void) => {
  escSet.add(func);
};
const removeFromEscStack = (func: (e: any) => void) => {
  // TODO: use a ordered dict to implement removing
  escSet.delete(func);
};

let escBond = false;
const binEscIfHavenot = () => {
  if (escBond) return;
  mousetrap.bind("esc", excuteEsc);
  escBond = true;
};

export const useEscShortCut = (
  callback: (e?: ExtendedKeyboardEvent) => void
) => {
  const prevFunc = usePrevious(callback);
  binEscIfHavenot();
  useEffect(() => {
    if (prevFunc !== callback) removeFromEscStack(prevFunc);
    pushToEscStack(callback);
    return () => {
      removeFromEscStack(callback);
    };
  }, [callback, prevFunc]);
};

/**

This hook is a wrapper of https://github.com/ccampbell/mousetrap

for reference of valid keybindings, please see https://craig.is/killing/mice

The original package allows calling `bind` with the same key multiple times. 
When doing so, the latter overrides the former.

I think that would cause unexpected behavior, 
so if you bind the same key+eventType twice, an error would be thrown.

*/

export const useMousetrap = (
  handlerKey: string | string[],
  callback: (e?: ExtendedKeyboardEvent) => void,
  eventType?: KeyEventType
): void => {
  const myID = useComponentId();
  useEffect(() => {
    const myKey = buildKey(handlerKey, eventType);
    if (!existingBindings.has(myKey)) {
      existingBindings.set(myKey, myID);
      mousetrap.bind(handlerKey, callback, eventType);
      return () => {
        mousetrap.unbind(handlerKey, eventType);
        existingBindings.delete(myKey);
      };
    } else if (existingBindings.get(myKey) !== myID) {
      console.error(`Key binding exists: ${myKey}.`);
    }
  }, [callback, eventType, handlerKey, myID]);
};

export const useEscStack = () => {
  return [pushToEscStack, removeFromEscStack];
};

export const useShortcutToggledBoolean = (
  handlerKey: string | string[],
  defaultValue = false,
  eventType?: KeyEventType
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [state, setState] = useState(defaultValue);
  const handleEvent = useCallback(() => {
    setState((prev) => !prev);
  }, [setState]);
  useMousetrap(handlerKey, handleEvent, eventType);
  return [state, setState];
};
