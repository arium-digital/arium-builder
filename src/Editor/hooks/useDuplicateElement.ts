import { useCallback } from "react";
import firestore from "@google-cloud/firestore";
import { merge } from "lodash";
import { Color } from "@material-ui/lab/Alert";
import { useState } from "react";
import { getElementsCollectionRef } from "shared/documentPaths";
import { CurrentEditingElementAndPath } from "components/InSpaceEditor/types";
import { Optional } from "types";

export type setAlert = (args: { message: string; severity: Color }) => void;

export const deepDupeSubtree = async (
  subtreeRootId: string,
  elementsCollectionRef: firestore.CollectionReference
) => {
  const makeCopy = async (
    nodeRef: firestore.DocumentReference,
    update?: Record<string, string>
  ) => {
    const copy = (await nodeRef.get()).data() as firestore.DocumentData;
    if (update != null) merge(copy, update); // inplace on purpose.
    return elementsCollectionRef.add(copy);
  };
  const subtreeRootRef = elementsCollectionRef.doc(subtreeRootId);
  const newName =
    ((await subtreeRootRef.get())?.data()?.name || "") + " - dupe";
  const rootCopy = await makeCopy(subtreeRootRef, {
    name: newName,
  });

  const seen: Set<string> = new Set();

  const dfs = async (originParentId: string, newParentId: string) => {
    // for child in chilren whose parent is original parent id
    // make a copy of the child,
    // point the copy's parent to new parent id
    // dfs with the orgin child id and the new child id recursively
    const children = await elementsCollectionRef
      .where("parentId", "==", originParentId)
      .get();
    for (const childRef of children.docs) {
      if (seen.has(childRef.id) || childRef.data().deleted === true) continue; // in case there's circle in the graph
      seen.add(childRef.id);
      await makeCopy(childRef.ref, {
        parentId: newParentId,
      }).then((childCopy) => dfs(childRef.id, childCopy.id));
    }
  };
  await dfs(subtreeRootId, rootCopy.id);
  return {
    id: rootCopy.id,
    ref: elementsCollectionRef.doc(rootCopy.id),
  };
};

export const useDuplicateElement = ({
  elementId,
  spaceId,
  selection,
  setSelection,
  setAlert,
}: {
  elementId: string | undefined;
  spaceId: string;
  selection: Optional<string[]>;
  setSelection: (selection: Optional<CurrentEditingElementAndPath>) => void;
  setAlert?: (arg: { message: string; severity: Color }) => void;
}) => {
  const [copying, setCopying] = useState(false);

  const handleDuplicate = useCallback(async () => {
    const elementsRef = getElementsCollectionRef(spaceId);
    if (!elementId || !selection || !elementsRef) return;
    setCopying(true);
    try {
      const { id: newId } = await deepDupeSubtree(elementId, elementsRef);
      if (setAlert) {
        setAlert({
          message: `Element duplicated. Editing the duplicated element.`,
          severity: "success",
        });
      }
      const parentPath = selection.slice(0, selection.length - 1);
      const newPath = [...parentPath, newId];
      // console.log('new element id', elementId, newPath)
      // @ts-ignore
      setSelection({
        path: newPath,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setCopying(false);
    }
  }, [elementId, spaceId, selection, setAlert, setSelection]);

  return { copying, duplicate: handleDuplicate };
};

export default useDuplicateElement;
