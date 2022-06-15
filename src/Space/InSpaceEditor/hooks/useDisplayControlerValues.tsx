import React, { useEffect } from "react";
import { Object3D, Vector3 } from "three";
import { EditorState } from "../types";
import { radiansToDegrees } from "libs/utils";
import { RenderAllAxesValues } from "../Toolbars/EditorToolBar";

const getValuesByMode = (mode: string, obj: Object3D): Vector3 | null => {
  switch (mode) {
    case "translate":
      return obj.position;
    case "rotate":
      const [x, y, z] = obj.rotation
        .toArray()
        .map((val) => radiansToDegrees(val));
      return new Vector3(x, y, z);
    case "scale":
      return obj.scale;
    default:
      return null;
  }
};

export const useDisplayControlerValues = (editorState: EditorState) => {
  const {
    transformControls: controls,
    setMessage,
    elementIsSelected,
  } = editorState;

  useEffect(() => {
    if (!controls || !elementIsSelected) return;
    const showValue = (e: any) => {
      const mode = controls.getMode();
      // @ts-ignore
      // let axis = controls._axis;
      // @ts-ignore
      const obj = controls.object;
      if (!obj) return setMessage(null);

      const values = getValuesByMode(mode, obj);
      if (!values) return setMessage(null);
      const msg = <RenderAllAxesValues mode={mode} vector={values} />;
      setMessage(msg);
    };

    controls.addEventListener("change", showValue);

    return () => {
      controls.removeEventListener("change", showValue);
    };
  }, [controls, elementIsSelected, setMessage]);

  useEffect(() => {
    if (!elementIsSelected) {
      setMessage(null);
    }
  }, [elementIsSelected, setMessage]);
};
