import React, { FC, useCallback, useMemo, useState } from "react";
import New from "./New";
import Edit from "./Edit";
import Grid from "@material-ui/core/Grid";
import { useStyles } from "../../styles";

import { getElementsCollectionRef } from "shared/documentPaths";
import Alert, { Color } from "@material-ui/lab/Alert";
import Paper from "@material-ui/core/Paper";
import { getElementRef } from "./ElementForm";
import Root from "./Tree/Root";
import useDuplicateElement from "Editor/hooks/useDuplicateElement";
import { CurrentEditingElementAndPath } from "Space/InSpaceEditor/types";
import { Optional } from "types";

const Elements: FC<{ spaceId: string }> = ({ spaceId }) => {
  const [selection, setSelection] = useState<
    Optional<CurrentEditingElementAndPath>
  >(null);

  const select = useCallback((path: Optional<CurrentEditingElementAndPath>) => {
    setCreating(undefined);
    setSelection(path);
  }, []);

  const [creating, setCreating] = useState<string[]>();

  const [alert, setAlert] = useState<{ message: string; severity: Color }>();

  const clearAlert = useCallback(() => {
    setAlert(undefined);
  }, []);

  const doneCreating = useCallback(
    (newPath?: Optional<CurrentEditingElementAndPath>) => {
      setAlert({
        message: "Element created",
        severity: "success",
      });
      setCreating(undefined);
      if (newPath) setSelection(newPath);
    },
    []
  );

  const editElementRef = useMemo(() => {
    if (!selection || selection.path.length === 0) return;
    return getElementRef(spaceId, selection.path);
  }, [spaceId, selection]);

  const elementId = editElementRef?.id;

  const { copying, duplicate: handleDuplicate } = useDuplicateElement({
    elementId,
    spaceId,
    selection: selection?.path,
    setSelection,
    setAlert,
  });

  const elementsRef = useMemo(() => getElementsCollectionRef(spaceId), [
    spaceId,
  ]);

  const classes = useStyles();

  if (!elementsRef) return null;

  return (
    <Grid container spacing={3} className={classes.gridRoot}>
      <Grid item xs={5} lg={4}>
        <Root
          select={select}
          selection={selection?.path || undefined}
          setCreating={setCreating}
          creating={creating}
          spaceId={spaceId}
          elementsRef={elementsRef}
          showCreateNode={true}
          showToggle={true}
        />
      </Grid>
      <Grid item xs={7} lg={8}>
        {alert && (
          <Paper className={classes.paper}>
            <Alert severity={alert.severity} onClose={clearAlert}>
              {alert.message}
            </Alert>
          </Paper>
        )}
        {creating && (
          <New spaceId={spaceId} path={creating} done={doneCreating} />
        )}
        {!creating && editElementRef && (
          <Edit
            elementRef={editElementRef}
            spaceId={spaceId}
            handleDuplicate={handleDuplicate}
            duplicating={copying}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default Elements;
