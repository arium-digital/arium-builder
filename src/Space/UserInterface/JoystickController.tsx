import { useCallback } from "react";
import Joystick from "Space/Controls/Joystick";
import { HandleJoystickMove } from "../componentTypes";
import { ariumCream } from "css/styleVariables";

const JoystickController = ({
  joystickMove,
}: {
  joystickMove: HandleJoystickMove;
}) => {
  const handleStop = useCallback(() => {
    joystickMove({
      type: "stop",
      x: null,
      y: null,
      direction: null,
    });
  }, [joystickMove]);
  return (
    <Joystick
      baseColor={ariumCream}
      stickColor={ariumCream}
      move={joystickMove}
      stop={handleStop}
      size={64}
    />
  );
};

export default JoystickController;
