import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { fromEvent } from "rxjs";
import { Intersection, Matrix3, Raycaster, Vector3 } from "three";
import {
  CURSOR_POSITION_DETECTION_MAX_DISTANCE,
  CURSOR_POSITION_DETECTION_LAYER,
} from "config";
import styles from "css/controls.module.scss";
const setCrosshairCursor = (
  canvas: HTMLCanvasElement | null | undefined,
  active: boolean
) => {
  if (canvas) {
    if (active) canvas.classList.add(styles.cursorCrosshair);
    else canvas.classList.remove(styles.cursorCrosshair);
  }
};
export const getGlobalNormal = (
  intersection?: Intersection
): Vector3 | undefined => {
  if (!intersection) return undefined;
  const normalMatrix = new Matrix3().getNormalMatrix(
    intersection.object.matrixWorld
  );
  return intersection.face?.normal.applyMatrix3(normalMatrix).normalize();
};

export type CursorIntersection = {
  intersection?: THREE.Intersection;
  normal?: Vector3;
  mouse: { x: number; y: number };
  mouseDirection: Vector3;
  mouseOrigin: Vector3;
};
export const useCursorIntersection = ({
  disable = false,
  disableNormal = false,
}: {
  disable?: boolean;
  disableNormal?: boolean;
} = {}): RefObject<CursorIntersection> => {
  const raycaster = useMemo(() => {
    const rc = new Raycaster();
    rc.far = CURSOR_POSITION_DETECTION_MAX_DISTANCE;
    rc.layers.set(CURSOR_POSITION_DETECTION_LAYER);
    return rc;
  }, []);

  const { camera, scene, gl } = useThree();

  const cursorIntersectino = useRef<CursorIntersection>({
    mouse: { x: 0, y: 0 },
    mouseDirection: new Vector3(),
    mouseOrigin: camera.position,
  });

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera({ x, y }, camera);

      const mouseDirection = raycaster.ray.direction;
      const mouseOrigin = raycaster.ray.origin;

      let firstIntersection: Intersection | null = null;

      if (!disable) {
        const objects = raycaster.intersectObjects(scene.children, true);

        firstIntersection = objects[0];
      }
      if (firstIntersection) {
        cursorIntersectino.current = {
          intersection: firstIntersection,
          mouse: { x: event.clientX, y: event.clientY },
          normal: disableNormal
            ? undefined
            : getGlobalNormal(firstIntersection),
          mouseOrigin,
          mouseDirection,
        };

        setCrosshairCursor(gl.domElement, true);
      } else {
        cursorIntersectino.current = {
          mouse: { x: event.clientX, y: event.clientY },
          mouseDirection,
          mouseOrigin,
        };
        setCrosshairCursor(gl.domElement, false);
      }
    },
    [disable, raycaster, camera, scene.children, disableNormal, gl.domElement]
  );

  useEffect(() => {
    const sub = fromEvent(gl.domElement, "mousemove").subscribe((e) =>
      onMouseMove(e as MouseEvent)
    );
    return () => {
      sub.unsubscribe();
      setCrosshairCursor(gl.domElement, false);
    };
  }, [gl, onMouseMove]);

  return cursorIntersectino;
};
