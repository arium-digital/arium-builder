import { Object3D, Vector3 } from "three";
import { BoxAndFrame } from "../Placard";
import { useMemo } from "react";
import { BoundingPlane } from "./boxUtils";
import { Observable } from "rxjs";
import { HasBackingAndFrameConfig } from "spaceTypes/text";

const FlexBoxAndFrame = ({
  boxConfig,
  setMesh,
  size: [width, height],
  pointerOver$,
}: {
  boxConfig: HasBackingAndFrameConfig;
  size: [number, number];
  setMesh: (mesh: Object3D | null) => void | undefined;
  pointerOver$: Observable<boolean> | undefined;
}) => {
  const planeParams = useMemo((): BoundingPlane => {
    return {
      center: new Vector3(width / 2, -height / 2, 0),
      size: new Vector3(width, height, 0),
    };
  }, [width, height]);

  const { backingMaterial, frameConfig } = boxConfig;

  if (!backingMaterial || !frameConfig) return null;

  return (
    <>
      <BoxAndFrame
        boxParams={planeParams}
        hasBacking={boxConfig.hasBacking}
        backingMaterial={backingMaterial}
        frameConfig={frameConfig}
        hasFrame={boxConfig.hasFrame}
        setMesh={setMesh}
        pointerOver$={pointerOver$}
        interactable
      />
    </>
  );
};

export default FlexBoxAndFrame;
