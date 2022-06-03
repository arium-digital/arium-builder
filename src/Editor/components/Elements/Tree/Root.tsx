import { CollectionReference } from "@google-cloud/firestore";
import { CurrentEditingElementAndPath } from "components/InSpaceEditor/types";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Optional } from "types";
import { ElementLeafNode } from "./Leaf";

const Root = ({
  select,
  selection,
  setCreating,
  creating,
  spaceId,
  elementsRef,
  showCreateNode,
  showToggle,
}: {
  select: (selection: Optional<CurrentEditingElementAndPath>) => void;
  selection: string[] | undefined;
  setCreating: (path: string[]) => void;
  creating: string[] | undefined;
  spaceId: string;
  elementsRef: CollectionReference;
  showCreateNode: boolean;
  showToggle: boolean;
}) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ElementLeafNode
        elementsCollectionRef={elementsRef}
        elementId={null}
        root
        select={select}
        selection={selection}
        path={[]}
        setCreating={setCreating}
        isCreating={creating !== undefined}
        spaceId={spaceId}
        parentElementIsDragging={false}
        showCreateNode={showCreateNode}
        showToggle={showToggle}
      />
    </DndProvider>
  );
};

export default Root;
