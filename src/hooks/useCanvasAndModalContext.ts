import { createContext } from "react";
import { RootState } from "@react-three/fiber";
import { SpaceContextType } from "types";
import { useBehaviorSubjectAndSetterFromCurrentValue } from "./useObservable";

export const SpaceContext = createContext<SpaceContextType | null>(null);

export const useCanvasAndModalContext = () => {
  const [
    modalOpen$,
    setModalOpen,
  ] = useBehaviorSubjectAndSetterFromCurrentValue(false);
  const [
    canvasContext$,
    setCanvasContext,
  ] = useBehaviorSubjectAndSetterFromCurrentValue<RootState | null>(null);

  return {
    modalOpen$,
    setModalOpen,
    canvasContext$,
    setCanvasContext,
  };
};
