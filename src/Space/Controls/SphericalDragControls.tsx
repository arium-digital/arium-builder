import { useEffect, useCallback, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { fromEvent, merge } from "rxjs";
import * as THREE from "three";
import styles from "css/controls.module.scss";
import { Html } from "@react-three/drei";
import { useState } from "react";
import { filter, withLatestFrom } from "rxjs/operators";
import { getTrackedTouch } from "./utils";
import { TOUCH_PANNING_SPEED_FACTOR } from "config";
import { useBehaviorSubjectFromCurrentValue } from "hooks/useObservable";

interface SphericalDragConfig {
  reverseDrag?: boolean;
  mouseDragRotationSpeed?: number;
  rotationSpeed?: number;
  enableDamping?: boolean;
  dampingFactor?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
}

const setGrabbingCursor = (
  canvas: HTMLCanvasElement | null | undefined,
  active: boolean
) => {
  if (canvas) {
    if (active && !canvas.classList.contains(styles.cursorGrabbing))
      canvas.classList.add(styles.cursorGrabbing);
    else if (!active && canvas.classList.contains(styles.cursorGrabbing))
      canvas.classList.remove(styles.cursorGrabbing);
  }
};
const movementSpeed = 0.002;

const PI_2 = Math.PI / 2;

const primaryButtonPressed = (buttons: number): boolean => {
  // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
  return (buttons & 1) === 1;
};

const getHighestTouch = (touches: TouchEvent["touches"]): Touch => {
  let touch = touches[0];
  for (let i = 1; i < touches.length; i++) {
    if (touches[i].clientY < touch.clientY) touch = touches[i];
  }
  return touch;
};

export const TouchInfo = () => {
  const [event, setEvent] = useState<TouchEvent | null>(null);
  const {
    gl: { domElement },
  } = useThree();

  useEffect(() => {
    const sub = merge(
      fromEvent<TouchEvent>(domElement, "touchstart"),
      fromEvent<TouchEvent>(domElement, "touchmove")
    ).subscribe(setEvent);
    return () => {
      sub.unsubscribe();
    };
  }, [domElement]);
  return (
    <Html
      // @ts-ignore
      position={null}
    >
      <div
        style={{
          position: "fixed",
          left: "32px",
          top: "120px",
          width: "100vw",
        }}
      >
        {event && <p>{event.touches.length}</p>}
        {event &&
          event.touches.length &&
          Array(event.touches.length)
            .fill(0)
            .map((val, i) => (
              <pre key={i}>
                {Math.round(event.touches[i].clientX)}
                {"  "}
                {Math.round(event.touches[i].clientY)}
              </pre>
            ))}
        <p></p>
      </div>
    </Html>
  );
};

const useMouseEvents = (
  moveCamera: (movementX: number, movementY: number) => void,
  disabled = false
) => {
  const {
    gl: { domElement },
  } = useThree();
  // handle mouse control
  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!primaryButtonPressed(event.buttons) || disabled) {
        setGrabbingCursor(domElement, false);
        return;
      }
      event.preventDefault();
      setGrabbingCursor(domElement, true);

      const movementX =
        // @ts-ignore
        event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      const movementY =
        // @ts-ignore
        event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      moveCamera(movementX, movementY);
      // rotateEndRef.current = mouse;
    },
    [domElement, moveCamera, disabled]
  );

  useEffect(() => {
    const sub = fromEvent(domElement, "mousemove").subscribe((e: Event) =>
      onMouseMove(e as MouseEvent)
    );

    return () => sub.unsubscribe();
  }, [domElement, onMouseMove]);

  useEffect(() => {
    const sub = fromEvent(domElement, "mouseup").subscribe((e: Event) =>
      setGrabbingCursor(domElement, false)
    );
    return () => {
      setGrabbingCursor(domElement, false);
      sub.unsubscribe();
    };
  }, [domElement, onMouseMove]);
};
const useTouchEvents = (
  moveCamera: (movementX: number, movementY: number) => void,
  disabled?: boolean
) => {
  const {
    gl: { domElement },
  } = useThree();
  // handle touch control
  const prevTouch = useRef<Touch | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    // only initiate if we're not tracking any touches
    if (prevTouch.current === null) {
      const touch = getHighestTouch(e.changedTouches);
      // exclude the joystick finger
      if (touch.clientX > 160 || touch.clientY < window.innerHeight - 160)
        prevTouch.current = touch;
    }
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (prevTouch.current !== null) {
      const touch = getTrackedTouch(e.changedTouches, prevTouch.current);
      // if we can get tracked touch from touchend event, meaning the finger is lifted.
      if (touch) prevTouch.current = null;
    }
  }, []);
  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;
      // @ts-ignore
      if (e.scale && e.scale !== 1) {
        e.preventDefault();
      }
      if (prevTouch.current === null) return;
      const touch = getTrackedTouch(e.changedTouches, prevTouch.current);
      if (touch === null) {
        // this means the finger is lifted fron screen, just like touch end,
        // prevTouch.current = null;
        return;
      }
      // if it didn't return early, we're successfully tracking a finger.
      e.preventDefault();
      const movementX = touch.clientX - prevTouch.current.clientX;
      const movementY = touch.clientY - prevTouch.current.clientY;
      moveCamera(
        movementX * TOUCH_PANNING_SPEED_FACTOR,
        movementY * TOUCH_PANNING_SPEED_FACTOR
      );
      prevTouch.current = touch;
    },
    [moveCamera, disabled]
  );
  const disabled$ = useBehaviorSubjectFromCurrentValue(disabled);

  useEffect(() => {
    const sub = fromEvent(document, "touchmove")
      .pipe(
        withLatestFrom(disabled$),
        filter(([, disabled]) => !disabled)
      )
      .subscribe({
        next: ([e]) => onTouchMove(e as TouchEvent),
      });
    return () => sub.unsubscribe();
  }, [domElement, onTouchMove, disabled$]);

  useEffect(() => {
    const sub = fromEvent(document, "touchstart")
      .pipe(
        withLatestFrom(disabled$),
        filter(([, disabled]) => !disabled)
      )
      .subscribe({
        next: ([e]) => onTouchStart(e as TouchEvent),
      });
    return () => sub.unsubscribe();
  }, [domElement, onTouchStart, disabled$]);

  useEffect(() => {
    const sub = fromEvent(document, "touchend").subscribe((e: Event) =>
      onTouchEnd(e as TouchEvent)
    );
    return () => sub.unsubscribe();
  }, [domElement, onTouchEnd]);
};

const SphericalDragControls = ({
  reverseDrag = false,
  mouseDragRotationSpeed = 15000,
  rotationSpeed = 2,
  enableDamping = true,
  dampingFactor = 0.8,
  minPolarAngle = Math.PI / 4,
  maxPolarAngle = (Math.PI * 3) / 4,
  disabled,
}: SphericalDragConfig & {
  disabled?: boolean;
}) => {
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const { camera } = useThree();
  // from three.js voxel painter example:

  const moveCamera = useCallback(
    (movementX: number, movementY: number) => {
      euler.current.setFromQuaternion(camera.quaternion);

      euler.current.y -= movementX * movementSpeed;
      euler.current.x -= movementY * movementSpeed;

      euler.current.x = Math.max(
        PI_2 - maxPolarAngle,
        Math.min(PI_2 - minPolarAngle, euler.current.x)
      );

      camera.quaternion.setFromEuler(euler.current);
    },
    [camera.quaternion, maxPolarAngle, minPolarAngle]
  );

  useMouseEvents(moveCamera, disabled);
  useTouchEvents(moveCamera, disabled);
  // return <TouchInfo />;
  return null;
};

export default SphericalDragControls;
