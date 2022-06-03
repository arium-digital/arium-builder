import { EditorStatus } from "components/InSpaceEditor/types";
import { useEffect } from "react";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  useBehaviorSubjectAndSetterFromCurrentValue,
  useCurrentValueOrDefault,
} from "../../../hooks/useObservable";

export const useIsEditorOpen = (
  status$?: Observable<EditorStatus>
): boolean => {
  const status = useCurrentValueOrDefault(status$, EditorStatus.closed);
  return status !== EditorStatus.closed;
};

export const useIsEditorOpen$ = (
  status$?: Observable<EditorStatus>
): Observable<boolean> => {
  const [
    isOpen$,
    setIsOpen,
  ] = useBehaviorSubjectAndSetterFromCurrentValue<boolean>(false);

  useEffect(() => {
    if (status$) {
      const sub = status$
        .pipe(map((status) => status !== EditorStatus.closed))
        .subscribe(setIsOpen);
      return () => {
        sub.unsubscribe();
      };
    }
  }, [setIsOpen, status$]);
  return isOpen$;
};

export const useIsAddingElements$ = (
  status$?: Observable<EditorStatus>
): Observable<boolean> => {
  const [
    isAdding$,
    setIsAdding,
  ] = useBehaviorSubjectAndSetterFromCurrentValue<boolean>(false);

  useEffect(() => {
    if (status$) {
      const sub = status$
        .pipe(map((status) => status === EditorStatus.adding))
        .subscribe(setIsAdding);
      return () => {
        sub.unsubscribe();
      };
    }
  }, [setIsAdding, status$]);

  return isAdding$;
};
