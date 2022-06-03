import React, { FC } from "react";
import { useStyles } from "../../../styles";
import firestore from "@google-cloud/firestore";
import { useElementsOfChildren } from "hooks/useElementsOfChildren";
import List from "@material-ui/core/List";
import { ElementLeafNode } from "./Leaf";
import { CurrentEditingElementAndPath } from "components/InSpaceEditor/types";
import { Optional } from "types";

const ElementChildren: FC<{
  elementsCollectionRef: firestore.CollectionReference;
  root: boolean | undefined;
  parentId: string | null;
  spaceId: string;
  path: string[];
  select: (selection: Optional<CurrentEditingElementAndPath>) => void;
  selection?: string[];
  setCreating: (path: string[]) => void;
  isCreating: boolean;
  parentElementIsDragging: boolean;
  showCreateNode: boolean;
  showToggle: boolean;
}> = ({
  elementsCollectionRef,
  parentId,
  root,
  path,
  select,
  selection,
  setCreating,
  spaceId,
  isCreating,
  parentElementIsDragging,
  showCreateNode,
  showToggle,
}) => {
  const elements = useElementsOfChildren({
    elementsCollectionRef,
    parentId,
    orderBy: "name",
  });
  const classes = useStyles();

  return (
    <List className={root ? classes.listRoot : classes.nested}>
      <>
        {elements &&
          Object.entries(elements).map(([id, element]) => (
            <ElementLeafNode
              element={element.config}
              elementRef={element.ref}
              elementsCollectionRef={elementsCollectionRef}
              elementId={id}
              showCreateNode={showCreateNode}
              key={id}
              path={[...path, id]}
              select={select}
              selection={selection}
              setCreating={setCreating}
              isCreating={isCreating}
              showToggle={showToggle}
              parentElementIsDragging={parentElementIsDragging}
              spaceId={spaceId}
            />
          ))}
      </>
    </List>
  );
};

export default ElementChildren;
