// taken from https://github.com/elmarti/react-joystick-component
import * as React from "react";
import { getTrackedTouch } from "./utils";

export interface IJoystickProps {
  size?: number;
  baseColor?: string;
  stickColor?: string;
  throttle?: number;
  disabled?: boolean;
  move?: (event: IJoystickUpdateEvent) => void;
  stop?: (event: IJoystickUpdateEvent) => void;
  start?: (event: IJoystickUpdateEvent) => void;
}
enum InteractionEvents {
  MouseDown = "mousedown",
  MouseMove = "mousemove",
  MouseUp = "mouseup",
  TouchStart = "touchstart",
  TouchMove = "touchmove",
  TouchEnd = "touchend",
}

export interface IJoystickUpdateEvent {
  type: "move" | "stop" | "start";
  x: number | null;
  y: number | null;
  direction: JoystickDirection | null;
}

export interface IJoystickState {
  dragging: boolean;
  coordinates?: IJoystickCoordinates;
}
type JoystickDirection = "FORWARD" | "RIGHT" | "LEFT" | "BACKWARD";
export interface IJoystickCoordinates {
  relativeX: number;
  relativeY: number;
  axisX: number;
  axisY: number;
  direction: JoystickDirection;
}

const joystickRadius = 64;
const joystickDiameter = joystickRadius * 2;

const Triangle = ({ rotation }: { rotation: number }) => {
  const triangleSize = 8;
  return (
    <g
      transform={`rotate(${rotation} ${joystickRadius} ${joystickRadius}) translate(${
        joystickRadius - triangleSize
      } 10)`}
    >
      <polygon
        points={`0,${triangleSize} ${triangleSize},0 ${
          triangleSize * 2
        },${triangleSize}`}
        fill="#FFFFF1"
      />
    </g>
  );
};

const BackgroundSvg = React.memo(() => {
  return (
    <svg
      width={joystickDiameter}
      height={joystickDiameter}
      viewBox={`0 0 ${joystickDiameter} ${joystickDiameter}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        opacity="0.2"
        cx={joystickRadius}
        cy={joystickRadius}
        r={joystickRadius - 1}
        fill="#FFFFF1"
        stroke="white"
      />
      <Triangle rotation={0} />
      <Triangle rotation={90} />
      <Triangle rotation={180} />
      <Triangle rotation={270} />
    </svg>
  );
});

class Joystick extends React.Component<IJoystickProps, IJoystickState> {
  private _stickRef: React.RefObject<any>;
  private _baseRef: React.RefObject<any>;
  private _trackedTouchRef: React.MutableRefObject<Touch | null>;
  private _throttleMoveCallback: (data: any) => void;
  private _boundMouseUp: EventListenerOrEventListenerObject;
  private _baseSize: number;
  // @ts-ignore
  private _parentRect: ClientRect;
  private _boundMouseMove: (event: any) => void;

  constructor(props: IJoystickProps) {
    super(props);
    this.state = {
      dragging: false,
    };
    this._trackedTouchRef = React.createRef();
    this._stickRef = React.createRef();
    this._baseRef = React.createRef();
    this._baseSize = props.size || 100;

    this._throttleMoveCallback = (() => {
      let lastCall = 0;
      return (event: any) => {
        const now = new Date().getTime();
        const throttleAmount = this.props.throttle || 0;
        if (now - lastCall < throttleAmount) {
          return;
        }
        lastCall = now;
        if (this.props.move) {
          return this.props.move(event);
        }
      };
    })();

    this._boundMouseUp = (e: any) => {
      this._mouseUp(e);
    };
    this._boundMouseMove = (event: any) => {
      this._mouseMove(event);
    };
  }

  private _updatePos(coordinates: IJoystickCoordinates) {
    window.requestAnimationFrame(() => {
      this.setState({
        coordinates,
      });
    });
    this._throttleMoveCallback({
      type: "move",
      x: coordinates.relativeX,
      y: -coordinates.relativeY,
      direction: coordinates.direction,
    });
  }

  private _mouseDown(e: any) {
    if (this.props.disabled !== true) {
      this._parentRect = this._baseRef.current.getBoundingClientRect();

      this.setState({
        dragging: true,
      });

      if (e.type === InteractionEvents.MouseDown) {
        window.addEventListener(InteractionEvents.MouseUp, this._boundMouseUp);
        window.addEventListener(
          InteractionEvents.MouseMove,
          this._boundMouseMove
        );
      } else {
        // touch start
        const touchEvent = e as TouchEvent;
        this._trackedTouchRef.current = touchEvent.changedTouches[0];
        window.addEventListener(InteractionEvents.TouchEnd, this._boundMouseUp);
        window.addEventListener(
          InteractionEvents.TouchMove,
          this._boundMouseMove
        );
      }

      if (this.props.start) {
        this.props.start({
          type: "start",
          x: null,
          y: null,
          direction: null,
        });
      }
    }
  }

  private _getDirection(atan2: number): JoystickDirection {
    if (atan2 > 2.35619449 || atan2 < -2.35619449) {
      return "FORWARD";
    } else if (atan2 < 2.35619449 && atan2 > 0.785398163) {
      return "RIGHT";
    } else if (atan2 < -0.785398163) {
      return "LEFT";
    }
    return "BACKWARD";
  }
  private _getWithinBounds(value: number): number {
    const halfBaseSize = this._baseSize / 2;
    if (value > halfBaseSize) {
      return halfBaseSize;
    }
    if (value < -halfBaseSize) {
      return halfBaseSize * -1;
    }
    return value;
  }
  private _mouseMove(event: any) {
    if (this.state.dragging) {
      let absoluteX = null;
      let absoluteY = null;
      if (event.type === InteractionEvents.MouseMove) {
        absoluteX = event.clientX;
        absoluteY = event.clientY;
      } else {
        // touchmove
        if (!this._trackedTouchRef.current) return;
        const touchEvent = event as TouchEvent;
        const touch = getTrackedTouch(
          touchEvent.changedTouches,
          this._trackedTouchRef.current
        );
        if (!touch) return;
        absoluteX = touch.clientX;
        absoluteY = touch.clientY;
      }

      const relativeX = this._getWithinBounds(
        absoluteX - this._parentRect.left - this._baseSize / 2
      );
      const relativeY = this._getWithinBounds(
        absoluteY - this._parentRect.top - this._baseSize / 2
      );
      const atan2 = Math.atan2(relativeX, relativeY);

      this._updatePos({
        relativeX,
        relativeY,
        direction: this._getDirection(atan2),
        axisX: absoluteX - this._parentRect.left,
        axisY: absoluteY - this._parentRect.top,
      });
    }
  }

  private _mouseUp(e: any) {
    if (this._trackedTouchRef.current && e.type === "touchend") {
      const touchEvent = e as TouchEvent;
      const touch = getTrackedTouch(
        touchEvent.changedTouches,
        this._trackedTouchRef.current
      );
      if (!touch) return;
    }
    this.setState({
      dragging: false,
      coordinates: undefined,
    });
    window.removeEventListener("mouseup", this._boundMouseUp);
    window.removeEventListener("mousemove", this._boundMouseMove);

    if (this.props.stop) {
      this.props.stop({
        type: "stop",
        x: null,
        y: null,
        direction: null,
      });
    }
  }
  private _getBaseStyle(): any {
    const baseSizeString: string = `${this._baseSize}px`;
    return {
      height: baseSizeString,
      width: baseSizeString,
      borderRadius: this._baseSize,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      cursor: "move",
      zIndex: 5000,
    };
  }
  private _getStickStyle(): any {
    const stickColor: string =
      this.props.stickColor !== undefined ? this.props.stickColor : "#3D59AB";
    const stickSize: string = `${joystickRadius}px`;

    let stickStyle = {
      background: stickColor,
      cursor: "move",
      height: stickSize,
      width: stickSize,
      borderRadius: this._baseSize,
      flexShrink: 0,
    };

    if (this.state.dragging && this.state.coordinates !== undefined) {
      stickStyle = Object.assign({}, stickStyle, {
        position: "absolute",
        transform: `translate3d(${this.state.coordinates.relativeX}px, ${this.state.coordinates.relativeY}px, 0)`,
      });
    }
    return stickStyle;
  }
  render() {
    const baseStyle = this._getBaseStyle();
    const stickStyle = this._getStickStyle();
    return (
      <div
        className={this.props.disabled ? "joystick-base-disabled" : ""}
        onMouseDown={this._mouseDown.bind(this)}
        onTouchStart={this._mouseDown.bind(this)}
        ref={this._baseRef}
        style={baseStyle}
      >
        <div style={{ position: "absolute" }}>
          <BackgroundSvg />
        </div>
        <div
          ref={this._stickRef}
          className={this.props.disabled ? "joystick-disabled" : ""}
          style={stickStyle}
        ></div>
      </div>
    );
  }
}

export default Joystick;
