import { memo, useMemo } from "react";
import { FrameConfiguration } from "spaceTypes/image";

export const HoverMeshFrame = memo(
  ({
    elementWidth,
    elementHeight,
    frameConfig,
    rotationY,
    visible = true,
  }: {
    elementWidth: number;
    elementHeight: number;
    frameConfig?: FrameConfiguration | null;
    rotationY?: number;
    visible?: boolean;
  }) => {
    const positions = useMemo(() => {
      let borderWidth = 0;
      if (frameConfig) {
        borderWidth = frameConfig.border ? frameConfig.border : 0;
      }

      const w = elementWidth + borderWidth * 2;
      const h = elementHeight + borderWidth * 2;
      const s = 0.0625;

      // prettier-ignore
      const vertices = new Float32Array([
        // ADB
        -w / 2, h / 2, 0,
        w / 2 + s, h / 2 + s, 0,
        -w / 2 - s, h / 2 + s, 0,

        // ACB
        -w / 2, h / 2, 0,
        w / 2, h / 2, 0,
        w / 2 + s, h / 2 + s, 0,

        // CFD
        w / 2, h / 2, 0,
        w / 2 + s, -h / 2 - s, 0,
        w / 2 + s, h / 2 + s, 0,

        // CEF
        w / 2, h / 2, 0,
        w / 2, -h / 2, 0,
        w / 2 + s, -h / 2 - s, 0,

        // EHF
        w / 2, -h / 2, 0,
        -w / 2 - s, -h / 2 - s, 0,
        w / 2 + s, -h / 2 - s, 0,

        // EGH
        w / 2, -h / 2, 0,
        -w / 2, -h / 2, 0,
        -w / 2 - s, -h / 2 - s, 0,

        // GBH
        -w / 2, -h / 2, 0,
        -w / 2 - s, h / 2 + s, 0,
        -w / 2 - s, -h / 2 - s, 0,

        // GAB
        -w / 2, -h / 2, 0,
        -w / 2, h / 2, 0,
        -w / 2 - s, h / 2 + s, 0

      ])

      return vertices;
    }, [elementWidth, elementHeight, frameConfig]);
    return (
      <>
        <mesh rotation-y={rotationY} visible={visible}>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <meshBasicMaterial
            color="white"
            transparent={true}
            opacity={0.5}
          ></meshBasicMaterial>
        </mesh>
      </>
    );
  }
);
