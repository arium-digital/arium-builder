import React, { useEffect, useState } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { Vector3Tuple } from "three";
import { Text } from "troika-three-text";
import { ariumMint } from "css/styleVariables";
import { Centered } from "../Editor/components/InSpaceForms/ElementFormBaseAndUtils";
import { Typography } from "@material-ui/core";

export const FourOFourSSR = ({
  type,
  id,
}: {
  type: "space" | "event";
  id?: string;
}) => {
  return (
    <Centered height="100vh">
      <div>
        <Typography variant="h1" align="center">
          404
        </Typography>
        <Typography align="center">
          {type} {id ? id + " " : ""} does not exist
        </Typography>
      </div>
    </Centered>
  );
};
export const FourOFourCSR = ({
  type,
  id,
}: {
  type: "space" | "event";
  id?: string;
}) => {
  useEffect(() => {
    extend({ Text });
  }, []);

  const [rotation, setRotation] = useState<Vector3Tuple>([0, 0, 0]);

  const onMouseMove = (e: any) => {
    setRotation([
      ((e.clientY / e.target.offsetHeight - 0.5) * -Math.PI) / 8,
      ((e.clientX / e.target.offsetWidth - 0.5) * -Math.PI) / 8,
      0,
    ]);
  };

  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
      dpr={window.devicePixelRatio}
      onMouseMove={onMouseMove}
    >
      <group position-z={-180} rotation={rotation}>
        <text
          //@ts-ignore
          text={"404"}
          fontSize={64}
          anchorX="center"
          anchorY="bottom"
        >
          <meshPhongMaterial attach="material" color={ariumMint} />
        </text>
        <text
          //@ts-ignore
          text={`${type} ${id ? id + " " : ""}does not exist`}
          fontSize={12}
          anchorX="center"
          anchorY="top"
        >
          <meshPhongMaterial attach="material" color={ariumMint} />
        </text>
      </group>

      <pointLight position={[-100, 0, -160]} />
      <pointLight position={[0, 0, -170]} />
      <pointLight position={[100, 0, -160]} />
    </Canvas>
  );
};
