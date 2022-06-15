import { DocumentRef, firestoreDelete } from "db";
import { useBehaviorSubjectAndSetterFromCurrentValue } from "hooks/useObservable";
import { cloneDeep } from "lodash";
import { useCallback, useMemo, useRef, useState } from "react";
import { Observable, Subject } from "rxjs";
import { CircularQueue } from "libs/circularQueue";
import { MAX_UNDO } from "config";
export type PushUndoItemFunction = (
  documentRef: DocumentRef,
  prevValues: Record<string, any>,
  newValues: Record<string, any>,
  isNew: boolean
) => Promise<void>;

export type UndoItem = {
  documentRef: DocumentRef;
  from: Record<string, any>;
  to: Record<string, any>;
  isNew: boolean;
};

export type UndoInstance = {
  undoStack: CircularQueue<UndoItem>;
  redoStack: Array<UndoItem>;
  canUndo$: Observable<boolean>;
  canRedo$: Observable<boolean>;
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
  pushUndoItem: PushUndoItemFunction;
  saving$: Observable<boolean>;
  stateChanges$: Observable<void>;
};

const getValueCopy = (data: Record<string, any>, path: string) => {
  const arr = path.split(".");

  const dfs = (values: Record<string, any>, i: number): any => {
    if (i === arr.length - 1)
      return (values || {})[arr[i]] || firestoreDelete();
    else return dfs((values || {})[arr[i]], i + 1);
  };

  return dfs(cloneDeep(data), 0);
};

export const useUndo = (): UndoInstance => {
  const undoStackRef = useRef<CircularQueue<UndoItem>>(
    new CircularQueue(MAX_UNDO)
  );
  const [canUndo$, setCanUndo] = useBehaviorSubjectAndSetterFromCurrentValue(
    false
  );

  const redoStackRef = useRef<Array<UndoItem>>([]);
  const [canRedo$, setCanRedo] = useBehaviorSubjectAndSetterFromCurrentValue(
    false
  );
  const [saving$, setSaving] = useBehaviorSubjectAndSetterFromCurrentValue(
    false
  );

  const [undoStateChanges$] = useState(new Subject<void>());

  const pushUndoItem = useCallback<PushUndoItemFunction>(
    async (documentRef, prevValues, newValues, isNew) => {
      // 1. retrieve previous values
      const paths = Object.keys(newValues);
      const from: Record<string, any> = {};
      paths.forEach((path) => {
        from[path] = getValueCopy(prevValues, path);
      });
      // // 2. build undo item and push
      undoStackRef.current.push({
        documentRef,
        from,
        to: newValues,
        isNew,
      });

      setCanUndo(undoStackRef.current.length > 0);
      redoStackRef.current.length = 0;
      setCanRedo(false);
    },
    [setCanRedo, setCanUndo]
  );

  const resolve = useCallback(() => {
    setSaving(false);
    undoStateChanges$.next();
    return true;
  }, [setSaving, undoStateChanges$]);

  const undo = useCallback(async () => {
    if (undoStackRef.current.length < 1) return false;
    setSaving(true);
    // 1. pop undo item
    const undoItem = undoStackRef.current.pop();
    if (undoItem == null) throw Error("undoStack is empty");

    // put undo item into redo stack
    redoStackRef.current.push(undoItem);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
    // 2. apply `from` value to document

    const { documentRef, from, isNew } = undoItem;

    if (isNew) {
      return documentRef.delete().then(resolve);
    } else return documentRef.update(from).then(resolve);
  }, [resolve, setCanRedo, setCanUndo, setSaving]);

  const redo = useCallback(async () => {
    if (redoStackRef.current.length < 1) return false;
    setSaving(true);
    // 1. pop redo item
    const redoItem = redoStackRef.current.pop();
    if (redoItem == null) throw Error("undoStack is empty");
    undoStackRef.current.push(redoItem);
    setCanRedo(redoStackRef.current.length > 0);
    setCanUndo(true); // always true

    // 2. apply `from` value to document
    const { documentRef, to, isNew } = redoItem;

    if (isNew) {
      return documentRef.set(to).then(resolve);
    } else return documentRef.update(to).then(resolve);
  }, [resolve, setCanRedo, setCanUndo, setSaving]);

  const instance = useMemo<UndoInstance>(
    () => ({
      undoStack: undoStackRef.current,
      redoStack: redoStackRef.current,
      canUndo$,
      canRedo$,
      saving$,
      pushUndoItem,
      undo,
      redo,
      stateChanges$: undoStateChanges$,
    }),
    [canUndo$, canRedo$, saving$, pushUndoItem, undo, redo, undoStateChanges$]
  );

  return instance;
};
