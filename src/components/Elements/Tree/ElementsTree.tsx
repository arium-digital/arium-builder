import React, { memo, RefObject, useMemo } from "react";
import { store } from "db";

import { UserInfo } from "communicationTypes";

import { RenderElementPreviewAtCursor } from "components/InSpaceEditor/ElementPreview";
import { CollectionReference } from "@google-cloud/firestore";

import { createContext } from "react";
import { Vector3 } from "three";

import { EditorContext } from "components/InSpaceEditor/hooks/useEditorState";
import ElementsChildren from "./ElementsChildren";
import useElementsTree from "./useElementsTree";
import useLoadedState from "./useLoadedState";

type ElementsProps = {
  spaceId: string;
  userInfo?: UserInfo;
  meshesChanged?: () => void;
  playerPositionRef: RefObject<Vector3 | undefined>;
  documentationMode?: boolean;
  handleProgressChanged?: (progress: number) => void;
};

export type ElementsContextType = ElementsProps;

export const ElementsContext = createContext<ElementsContextType | null>(null);
const emptyPath: string[] = [];
const Elements = memo((props: ElementsProps) => {
  const { spaceId } = props;

  const elementsCollectionRef = useMemo(
    () =>
      (store
        .collection("spaces")
        .doc(spaceId)
        .collection("elementsTree") as unknown) as CollectionReference,
    [spaceId]
  );

  const elementsTree = useElementsTree({ spaceId });

  const loadedState = useLoadedState({
    totalInitialElements: elementsTree?.initialCount,
    initialElements: elementsTree?.initialElements,
    handleProgressChanged: props.handleProgressChanged,
    spaceId,
  });

  if (!elementsTree) return null;

  return (
    <>
      <EditorContext.Consumer>
        {(editorState) => (
          <>
            <ElementsContext.Provider
              value={{
                ...props,
              }}
            >
              <>
                <ElementsChildren
                  {...{
                    ...props,
                    parentPath: emptyPath,
                    elementId: null,
                    elementsCollectionRef,
                    editorState,
                    elementsTree: elementsTree.elements,
                    handleElementLoaded: loadedState.handleLoaded,
                  }}
                />
              </>
            </ElementsContext.Provider>
            {editorState && (
              <RenderElementPreviewAtCursor
                {...props}
                parentPath={emptyPath}
                editorState={editorState}
                elementsTree={elementsTree.elements}
              />
            )}
          </>
        )}
      </EditorContext.Consumer>
    </>
  );
});

export default Elements;
