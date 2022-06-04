import { TextConfig } from "spaceTypes";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Font, TextGeometry } from "three";

import helvetiker_bold from "../../assets/fonts/helvetiker_bold.typeface.json";
import { toThreeColor } from "libs/color";
import { useGlobalPointerOverLayer } from "hooks/useLayers";
import { PointerOverContext } from "hooks/useGlobalPointerOver";
import { Optional } from "types";
import { extend, Object3DNode } from "@react-three/fiber";

extend({ TextGeometry });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>;
    }
  }
}

// const fixSideNormals = ({
//   height = 0.1,
//   size = 0.1,
//   textGeo,
// }: {
//   height?: number;
//   size?: number;
//   textGeo: TextGeometry;
// }) => {
//   const triangleAreaHeuristics = 0.1 * (height * size);
//   const triangle = new Triangle();

//   for (let i = 0; i < textGeo.faces.length; i++) {
//     const face = textGeo.faces[i];

//     if (face.materialIndex === 1) {
//       for (let j = 0; j < face.vertexNormals.length; j++) {
//         face.vertexNormals[j].z = 0;
//         face.vertexNormals[j].normalize();
//       }

//       const va = textGeo.vertices[face.a];
//       const vb = textGeo.vertices[face.b];
//       const vc = textGeo.vertices[face.c];

//       const s = triangle.set(va, vb, vc).getArea();

//       if (s > triangleAreaHeuristics) {
//         for (let j = 0; j < face.vertexNormals.length; j++) {
//           face.vertexNormals[j].copy(face.normal);
//         }
//       }
//     }
//   }
// };
export const FONT_SCALE = 0.01;

const TextDisplay = ({ config }: { config: TextConfig }) => {
  const [font, setFont] = useState<Font | null>(null);

  useEffect(() => {
    const font = new Font(helvetiker_bold);
    setFont(font);
  }, []);

  const [textGeometry, setTextGeometry] = useState<Optional<TextGeometry>>();

  const height = config.height;
  const size = useMemo(() => {
    const scale = config.legacyFontScale
      ? FONT_SCALE / config.legacyFontScale
      : FONT_SCALE;
    return scale * (config.size || 16);
  }, [config.size, config.legacyFontScale]);

  useEffect(() => {
    // "fix" side normals by removing z-component of normals for side faces
    // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)
    if (!textGeometry) return;

    textGeometry.computeVertexNormals();

    // if (!bevelEnabled) {
    //   fixSideNormals({
    //     height,
    //     size,
    //     textGeo: textGeometry,
    //   });
    // }
  }, [height, size, textGeometry]);

  const pointerOverContext = useContext(PointerOverContext);

  const setMesh = useGlobalPointerOverLayer(
    pointerOverContext?.enablePointerOverLayer$
  );
  const geometryArgs = useMemo(
    () => [
      config.text,
      {
        font,
        ...config.textGeometry,
        height: config.height,
        size,
      },
    ],
    [config.height, config.text, config.textGeometry, font, size]
  );
  if (!font) return null;
  return (
    <mesh
      ref={setMesh}
      castShadow={config.shadow?.cast}
      receiveShadow={config.shadow?.receive}
    >
      <textGeometry
        ref={setTextGeometry}
        // @ts-ignore
        args={geometryArgs}
      />
      <meshPhongMaterial color={toThreeColor(config.frontColor)} flatShading />
    </mesh>
  );
};

export default TextDisplay;
