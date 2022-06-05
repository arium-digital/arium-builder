import { useCallback, useMemo, useState } from "react";
import Root from "Editor/components/Tree/Root";
import { CurrentEditingElementAndPath, HasEditorState } from "./types";
import { getElementsCollectionRef } from "shared/documentPaths";
import Drawer from "@material-ui/core/Drawer";
import styles from "./styles.module.scss";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import { Optional } from "types";

const ContentTree = ({
  editorState,
  open,
  handleClose,
}: HasEditorState & {
  open: boolean;
  handleClose: () => void;
}) => {
  const elementsRef = useMemo(
    () => getElementsCollectionRef(editorState.spaceId),
    [editorState.spaceId]
  );

  const {
    currentEditingElementPath: selection,
    setCurrentEditingElementAndPath: setCurrentEditingElementPath,
  } = editorState;

  const [creating, setCreating] = useState<string[]>();

  // const [selection, setSelection] = useState<string[]>();
  const select = useCallback(
    (selection: Optional<CurrentEditingElementAndPath>) => {
      setCreating(undefined);
      setCurrentEditingElementPath(selection);
    },
    [setCurrentEditingElementPath]
  );

  if (!elementsRef) return null;
  return (
    <Drawer
      className={styles.drawer}
      variant="persistent"
      anchor="left"
      open={open}
      classes={{
        paper: styles.drawerPaper,
      }}
    >
      <div className={styles.drawerHeader}>
        <IconButton onClick={handleClose}>{<ChevronLeftIcon />}</IconButton>
        Space Elements
      </div>
      <Divider />
      <Root
        select={select}
        selection={selection || undefined}
        setCreating={setCreating}
        creating={creating}
        spaceId={editorState.spaceId}
        elementsRef={elementsRef}
        showCreateNode={false}
        showToggle={false}
      />
    </Drawer>
  );
};

export default ContentTree;
