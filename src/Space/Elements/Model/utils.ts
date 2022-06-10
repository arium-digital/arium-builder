import { Vector3 } from "three";
import { Transform } from "spaceTypes";
import { GridSize } from "@material-ui/core/Grid";
import { MediaSize } from "./types";

const getPositionVector3 = (data: Transform | Vector3): Vector3 | null => {
  if (data instanceof Vector3) {
    return data;
  } else {
    if (data.position == null) return null;
    const { x, y, z } = data.position!;
    return new Vector3(x, y, z);
  }
};

export const inRange = (
  A: Vector3 | Transform | undefined,
  B: Vector3 | Transform | undefined,
  distSquared: number = 20
): boolean => {
  if (A == null || B == null) return false;

  const Av3 = getPositionVector3(A);
  const Bv3 = getPositionVector3(B);

  if (Av3 == null || Bv3 == null) return false;
  return Av3.distanceToSquared(Bv3) < distSquared;
};

interface GridSizeSpec {
  xs?: GridSize;
  sm?: GridSize;
  md?: GridSize;
  lg?: GridSize;
  xl?: GridSize;
}

interface ColumnSizes {
  details: GridSizeSpec;
  text: GridSizeSpec;
}

export const getModuleColumnSizes = ({
  showAssetDetails,
}: {
  showAssetDetails: boolean;
}): ColumnSizes => {
  if (showAssetDetails)
    return {
      details: {
        xs: 12,
        sm: 6,
        lg: 8,
      },
      text: {
        xs: 12,
        sm: 6,
        lg: 4,
      },
    };

  return {
    details: {
      xs: 12,
    },
    text: {
      xs: 12,
    },
  };
};

export const getMediaElementSize = ({
  mediaSize,
  containerHeight,
  containerWidth,
}: {
  mediaSize: MediaSize | undefined;
  containerHeight: number | undefined;
  containerWidth: number | undefined;
}) => {
  if (
    !mediaSize ||
    !containerHeight ||
    !containerWidth ||
    !mediaSize.width ||
    !mediaSize.height
  ) {
    return { width: undefined, height: undefined };
  }
  // if video is taller than wide, make sure it fits in the box by making
  // its height smaller
  // const containerAspect = containerWidth / containerHeight;

  // const videoAspect = mediaSize.width / mediaSize.height;
  // if wider than tall
  const widthScale = containerWidth / mediaSize.width;
  const heightScale = containerHeight / mediaSize.height;
  let scale: number;
  if (widthScale < heightScale) {
    scale = widthScale;
  } else {
    scale = heightScale;
  }

  const width = scale * mediaSize.width;
  const height = scale * mediaSize.height;

  return { width, height };
};
