import React, { useCallback } from "react";
import { HasEditorState } from "components/InSpaceEditor/types";
// import { TransformAutoSaveHandler } from "./TransformAutoSaveHandler";
import styles from "./styles.module.scss";
import { MuiThemeProvider } from "@material-ui/core";
import InSpaceForm from "../../Editor/components/InSpaceForms/InSpaceForm";
import { editorTheme } from "./editorTheme";
import CssBaseline from "@material-ui/core/CssBaseline";
import { useEscShortCut, useMousetrap } from "hooks/useMousetrap";
import { useIsEditorOpen } from "components/InSpaceEditor/hooks/useEditorStatus";
import EditorToolBar from "components/InSpaceEditor/Toolbars/EditorToolBar";
import {
  useCloseEditorAction,
  useToggleEditorAction,
} from "./hooks/useEditorActions";
import { MessageDisplay } from "./MessageDisplay";
import ContentTree from "./ContentTree";
import clsx from "clsx";

const InSpaceEditor = ({ editorState }: HasEditorState) => {
  const isOpen = useIsEditorOpen(editorState.status$);

  useMousetrap("t", useToggleEditorAction(editorState));

  useEscShortCut(useCloseEditorAction(editorState));

  const { setContentsTreeOpen, contentsTreeOpen: drawerOpen } = editorState;

  const handleDrawerClose = useCallback(() => {
    setContentsTreeOpen(false);
  }, [setContentsTreeOpen]);

  const handleToggleTree = useCallback(() => {
    setContentsTreeOpen((existing) => !existing);
  }, [setContentsTreeOpen]);

  if (!isOpen) return null;
  return (
    <div className={styles.root}>
      <MuiThemeProvider theme={editorTheme}>
        <CssBaseline />
        <ContentTree
          editorState={editorState}
          open={drawerOpen}
          handleClose={handleDrawerClose}
        />
        <main
          className={clsx(styles.content, {
            [styles.contentShift]: drawerOpen,
          })}
        >
          <EditorToolBar
            editorState={editorState}
            handleToggleTree={handleToggleTree}
            treeOpen={drawerOpen}
          />
        </main>
        {/* <TransformAutoSaveHandler editorState={editorState} /> */}
        <MessageDisplay editorState={editorState} />
        <InSpaceForm editorState={editorState} />
      </MuiThemeProvider>
    </div>
  );
};

export default InSpaceEditor;
