import React, { useCallback, useEffect, useState } from "react";
import { ElementConfig } from "spaceTypes";

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "Space/ErrorBoundaryFallback";

import { GLOBAL_POINTER_OVER_LAYER } from "config";
import {
  PointerOverContext,
  useDynamicGlobalPointerOverLayer,
} from "hooks/useGlobalPointerOver";

import { useConfigOrDefaultRecursive } from "hooks/spaceHooks";
import { defaultTransform } from "defaultConfigs";
import { toVector3 } from "libs/utils";

import { useContext } from "react";
import { EditorState } from "Space/InSpaceEditor/types";
import { EditorContext } from "Space/InSpaceEditor/hooks/useEditorState";
import RenderElementByTypeInner from "./RenderElementByType";
import ElementsChildren from "./ElementsChildren";
import RenderEditableElementByType from "./RenderEditableElementByType";
import { isIOS } from "libs/deviceDetect";
import { ElementsAndParentsWithCount } from "./useElementsTree";

export type ElementProps = {
  elementId: string;
  parentPath: string[];
  elementConfig: ElementConfig;
  editorState: EditorState | null;
  elementsTree: ElementsAndParentsWithCount;
  handleElementLoaded: ((elementId: string) => void) | undefined;
};

export const GROUP_LAYERS = [GLOBAL_POINTER_OVER_LAYER];

const Element = (props: ElementProps): JSX.Element | null => {
  const {
    elementConfig,
    elementId,
    elementConfig: { transform, hideOnMobile },
  } = props;

  const editorState = useContext(EditorContext);

  const pointerOverContext = useDynamicGlobalPointerOverLayer(
    editorState,
    elementConfig
  );

  const transformNoNulls = useConfigOrDefaultRecursive(
    transform,
    defaultTransform
  );

  const [convertedTransformValues, setConvertedTransformValues] = useState<
    | {
        position: [number, number, number] | undefined;
        rotation: [number, number, number] | undefined;
        scale: [number, number, number] | undefined;
      }
    | undefined
  >();

  useEffect(() => {
    setConvertedTransformValues({
      position: toVector3(transformNoNulls.position),
      rotation: toVector3(transformNoNulls.rotation),
      scale: toVector3(transformNoNulls.scale),
    });
  }, [transformNoNulls]);

  const [useTransformValuesFromData, setUseTransformValuesFromData] = useState(
    true
  );

  const transformControlsMode = editorState?.transformControlsMode;
  const currentEditingElementPath = editorState?.currentEditingElementPath;

  useEffect(() => {
    if (!transformControlsMode || !currentEditingElementPath) return;
    const editingElementId =
      currentEditingElementPath[currentEditingElementPath.length - 1];
    if (editingElementId === props.elementId) {
      setUseTransformValuesFromData(true);

      return () => {
        setUseTransformValuesFromData(false);
      };
    }
  }, [transformControlsMode, props.elementId, currentEditingElementPath]);

  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (hideOnMobile) {
      if (isIOS()) setHide(true);
    } else {
      setHide(false);
    }
  }, [hideOnMobile]);

  const { handleElementLoaded } = props;

  const handleLoaded = useCallback(() => {
    handleElementLoaded && handleElementLoaded(elementId);
  }, [handleElementLoaded, elementId]);

  useEffect(() => {
    if (hide) {
      handleLoaded();
    }
  }, [hide, handleLoaded]);

  const onError = useCallback(
    (error: Error, info: { componentStack: string }) => {
      console.error(error, info);
      handleLoaded();
    },
    [handleLoaded]
  );

  if (hide) return null;

  return (
    <>
      <group
        name={elementId}
        key={elementId}
        ref={pointerOverContext.setElementGroup}
        // @ts-ignore
        layers={GROUP_LAYERS}
        position={
          useTransformValuesFromData
            ? convertedTransformValues?.position
            : undefined
        }
        rotation={
          useTransformValuesFromData
            ? convertedTransformValues?.rotation
            : undefined
        }
        scale={
          useTransformValuesFromData
            ? convertedTransformValues?.scale
            : undefined
        }
      >
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={onError}
          resetKeys={Object.values(elementConfig)}
        >
          <PointerOverContext.Provider value={pointerOverContext}>
            {editorState ? (
              <RenderEditableElementByType
                {...{ ...props }}
                editorState={editorState}
                pointerOverElementGroup={pointerOverContext.elementGroup}
                handleElementLoaded={handleElementLoaded}
              />
            ) : (
              <RenderElementByTypeInner
                {...{ ...props, handleElementLoaded }}
              />
            )}
          </PointerOverContext.Provider>
        </ErrorBoundary>
        {props.elementsTree[elementId] && (
          <ElementsChildren
            {...{ ...props, parentId: elementId, handleElementLoaded }}
            editorState={editorState}
          />
        )}
      </group>
    </>
  );
};

export default Element;
