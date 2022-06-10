import {
  GLOBAL_POINTER_OVER_LAYER,
  CURSOR_POSITION_DETECTION_LAYER,
} from "config";
import React, { SetStateAction, useEffect, useMemo, useState } from "react";
import { Observable } from "rxjs";
import { Object3D } from "three";
import { Optional } from "types";
import { useCurrentValueFromObservable } from "./useObservable";

/**
 * pass the return value as ref={} to the object
 *
 * @param layers example {1: true, 2:false} means turn on 1, turn off 2
 * @returns
 */
export const useDynamicLayers = (
  layers: Record<number, boolean>
): React.Dispatch<SetStateAction<Optional<Object3D>>> => {
  const [obj, bind] = useState<Optional<Object3D>>();
  useEffect(() => {
    if (obj) {
      for (const [layer, enable] of Object.entries(layers)) {
        if (enable) obj.layers.enable(parseInt(layer));
        else obj.layers.disable(parseInt(layer));
      }
    }
  }, [layers, obj]);
  return bind;
};

/**
 * this wraps useDynamicLayers to toggle on/off GLOBAL_POINTER_OVER_LAYER.
 * also this turns on POSITION_DETECTION_LAYER by default
 * Note: Please don't use this on <group />, for groups can't intersect with raycasters. Please only bind this on <mesh />
 * @param enablePointerOverLayer$
 * @param enableCursorPositionLayer
 * @returns
 */
export const useGlobalPointerOverLayer = (
  enablePointerOverLayer$: Observable<boolean> | undefined
): ReturnType<typeof useDynamicLayers> => {
  const enablePointerOverLayer = useCurrentValueFromObservable(
    enablePointerOverLayer$,
    false
  );

  const layersConfig = useMemo(
    () => ({
      [GLOBAL_POINTER_OVER_LAYER]: enablePointerOverLayer,
      [CURSOR_POSITION_DETECTION_LAYER]: enablePointerOverLayer,
    }),
    [enablePointerOverLayer]
  );
  return useDynamicLayers(layersConfig);
};
