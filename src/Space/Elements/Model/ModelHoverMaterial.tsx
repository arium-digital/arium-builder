import React, { useEffect, useState } from "react";
import { Color, Group, MeshBasicMaterial, Object3D } from "three";
import { IModelHoverMaterial } from "./types";

const ModelHoverMaterial: React.FC<IModelHoverMaterial> = ({
  model,
  enabled,
}) => {
  const [highlightObject, setHighlightObject] = useState<Group>();

  useEffect(() => {
    const highlightObject = model.clone();
    highlightObject.visible = false;
    highlightObject.scale.set(
      (model.scale.x || 1) * 1.02,
      (model.scale.y || 1) * 1.02,
      (model.scale.z || 1) * 1.02
    );

    const highlightMaterial = new MeshBasicMaterial({
      color: new Color("white"),
      transparent: true,
      opacity: 0.5,
    });

    highlightObject.traverse((child: Object3D) => {
      // @ts-ignore
      if (child.isMesh)
        // @ts-ignore
        child.material = highlightMaterial;
    });
    setHighlightObject(highlightObject);

    return () => {
      highlightObject.visible = false;
    };
  }, [model]);

  // Effect to update model material parameters
  useEffect(() => {
    if (!highlightObject) return;
    if (enabled) {
      highlightObject.visible = true;

      return () => {
        highlightObject.visible = false;
      };
    }
  }, [highlightObject, enabled, model]);

  if (!highlightObject) return null;
  return <primitive object={highlightObject} />;
};

export default ModelHoverMaterial;
