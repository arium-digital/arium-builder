import { Toolbar } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { useCallback } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HasEditorState } from "../../../components/InSpaceEditor/types";
import InSpaceEffectsForm from "./InSpaceEffectsForm";
import { SimplifiedFormBase } from "./SimplifiedFormBaseAndUtils";
import styles from "components/InSpaceEditor/styles.module.scss";
import InSpaceSkyBoxForm from "./InSpaceSkyboxForm";

const InSpaceSettingsForm = ({ editorState }: HasEditorState) => {
  const dontPropagate = useCallback((e: Event) => {
    e.stopPropagation();
  }, []);

  const spaceId = editorState.spaceId;
  const { pushUndoItem } = editorState.undoInstance;

  return (
    <ErrorBoundary fallback={<div>An unexpeced error occured...</div>}>
      <div
        className={styles.tinyEditorContainer}
        // @ts-ignore
        onKeyDown={dontPropagate}
        // @ts-ignore
        onKeyUp={dontPropagate}
      >
        <Paper>
          <Toolbar className={styles.topToolbar}>
            <div className={styles.grow} />
            Space Settings
          </Toolbar>
          <SimplifiedFormBase tabLabels={["Effects", "Sky Box"]}>
            <InSpaceEffectsForm spaceId={spaceId} pushUndoItem={pushUndoItem} />
            <InSpaceSkyBoxForm spaceId={spaceId} />
          </SimplifiedFormBase>
        </Paper>
      </div>
    </ErrorBoundary>
  );
};

export default InSpaceSettingsForm;
