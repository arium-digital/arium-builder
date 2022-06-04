import React, { useMemo } from "react";
import Element from "./Element";
import { EditorState } from "Space/InSpaceEditor/types";
import { ElementsAndParentsWithCount, rootId } from "./useElementsTree";

const ElementsChildren = ({
  elementsTree,
  parentPath,
  elementId,
  editorState,
  handleElementLoaded,
}: {
  elementsTree: ElementsAndParentsWithCount;
  parentPath: string[];
  elementId: string | null;
  editorState: EditorState | null;
  handleElementLoaded: ((elementId: string) => void) | undefined;
}) => {
  const path = useMemo(() => {
    if (!elementId) return parentPath;

    return [...parentPath, elementId];
  }, [elementId, parentPath]);

  const elementConfigs = elementsTree[elementId || rootId];

  if (!elementConfigs) return null;

  return (
    <group>
      {Object.entries(elementConfigs.configs).map(([id, config]) => (
        <Element
          key={id}
          elementConfig={config}
          elementId={id}
          parentPath={path}
          editorState={editorState}
          handleElementLoaded={handleElementLoaded}
          elementsTree={elementsTree}
        />
      ))}
    </group>
  );
};

export default ElementsChildren;
