import { DEFAULT_IMAGE_WIDTH } from "defaultConfigs";
import { useMemo } from "react";

type CalculateElementShape = {
  (
    aspectRatio: number,
    targetWidth: number | undefined,
    defaultWidth?: number
  ): { width: number; height: number };
  (
    aspectRatio: undefined,
    targetWidth: number | undefined,
    defaultWidth?: number
  ): null;
  (
    aspectRatio: undefined | number,
    targetWidth: number | undefined,
    defaultWidth?: number
  ): null | { width: number; height: number };
};

export const calculateElementShape: CalculateElementShape = (
  aspectRatio,
  targetWidth,
  defaultWidth = DEFAULT_IMAGE_WIDTH
): any => {
  if (!aspectRatio) return null;
  const targetWidthToUse = targetWidth == null ? defaultWidth : targetWidth;
  return { width: targetWidthToUse, height: targetWidthToUse / aspectRatio };
};

export const useElementDimensions: CalculateElementShape = (
  aspectRatio: undefined | number,
  targetWidth: number | undefined,
  defaultWidth: number = DEFAULT_IMAGE_WIDTH
): any => {
  const dimensions = useMemo<{ width: number; height: number } | null>(
    () => calculateElementShape(aspectRatio, targetWidth, defaultWidth),
    [defaultWidth, aspectRatio, targetWidth]
  );
  return dimensions;
};
