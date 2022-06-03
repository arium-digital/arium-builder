import { useCurrentValueFromObservable } from "hooks/useObservable";
import { Observable } from "rxjs";
import { EditorStatus } from "../types";

export const isEditorOpen = (status: EditorStatus | null): boolean => {
  return !!status && status !== EditorStatus.closed;
};

export const useIsEditorOpen = (status$: Observable<EditorStatus>) => {
  const status = useCurrentValueFromObservable(status$, EditorStatus.closed);

  return isEditorOpen(status);
};
