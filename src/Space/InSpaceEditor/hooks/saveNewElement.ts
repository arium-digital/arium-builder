import { store } from "db";
import { PushUndoItemFunction } from "Editor/hooks/useUndo";
import { stripUndefined } from "libs/utils";
import { ElementConfig } from "spaceTypes";

const saveNewElement = async (
  spaceId: string,
  path: string[],
  newElement: ElementConfig,
  pushUndoItem?: PushUndoItemFunction
) => {
  // console.log("getting collection ref");
  const collectionRef = store
    .collection("spaces")
    .doc(spaceId)
    .collection("elementsTree");

  // console.log("saving new to ", collectionRef.path);
  const parentId = path.length > 0 ? path[path.length - 1] : null;

  const toInsert = stripUndefined({
    ...newElement,
    parentId,
  });

  const pushedRef = await collectionRef.add(toInsert);

  pushUndoItem && pushUndoItem(pushedRef, {}, toInsert, true);
  const newId = pushedRef.id;

  return {
    path: [...path, newId],
    ref: pushedRef,
  };
};

export default saveNewElement;
