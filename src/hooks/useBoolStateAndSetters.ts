import { useCallback, useState } from "react";

export const useBoolStateAndSetters = (
  initalState = false
): [boolean, () => void, () => void, () => void] => {
  const [bool, setBool] = useState(initalState);

  const handleSetTrue = useCallback(() => setBool(true), []);
  const handleSetFalse = useCallback(() => setBool(false), []);
  const handleToggle = useCallback(() => setBool((prev) => !prev), []);

  return [bool, handleSetTrue, handleSetFalse, handleToggle];
};
