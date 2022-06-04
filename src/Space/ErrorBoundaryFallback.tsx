import { Billboard, Plane, Text } from "@react-three/drei";
import React, { FC } from "react";

import { FallbackProps } from "react-error-boundary";

const billboardPosition: [number, number, number] = [0, 0.5, 0];
const textPosition1: [number, number, number] = [0, 0.1, 0.1];
const textPosition2: [number, number, number] = [0, -0.1, 0.1];
const planeArgs: [number, number] = [3, 1];

const ErrorFallback: FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <>
      <Billboard
        position={billboardPosition}
        follow={true} // Follow the camera (default=true)
        lockX={false} // Lock the rotation on the x axis (default=false)
        lockY={false} // Lock the rotation on the y axis (default=false)
        lockZ={false} // Lock the rotation on the z axis (default=false)
      >
        <Plane args={planeArgs} material-color="white" />
        <Text color="#f29f05" position={textPosition1}>
          {`Could not load element because of an error`}
        </Text>
        <Text
          color="gray"
          position={textPosition2}
          overflowWrap="normal"
          maxWidth={2.5}
          fontSize={0.05}
        >
          {error.message}
        </Text>
      </Billboard>
    </>
  );
};

export default ErrorFallback;
