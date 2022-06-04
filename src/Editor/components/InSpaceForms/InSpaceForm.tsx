import { useIsEditorOpen } from "Space/InSpaceEditor/hooks/useEditorStatus";
import { HasEditorState } from "../../../Space/InSpaceEditor/types";
import InSpaceElementForm from "./InSpaceElementForm";
import InSpaceSettingsForm from "./InSpaceSettingsForm";

const RenderEditorConditionally = ({ editorState }: HasEditorState) => {
  const isOpen = useIsEditorOpen(editorState.status$);
  const selectedElementPath = editorState.currentEditingElementPath;
  const settingsOpen = editorState.settingsOpen;

  if (!isOpen) return null;

  if (selectedElementPath)
    return (
      <InSpaceElementForm
        editorState={editorState}
        selectedElementPath={selectedElementPath}
      />
    );

  if (settingsOpen) return <InSpaceSettingsForm editorState={editorState} />;
  return null;
};

export default RenderEditorConditionally;
