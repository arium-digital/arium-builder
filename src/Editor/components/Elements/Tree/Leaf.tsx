import React, {
  useCallback,
  useEffect,
  useState,
  SyntheticEvent,
  useMemo,
  FC,
} from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { ElementConfig, ElementType } from "../../../../spaceTypes";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Switch from "@material-ui/core/Switch";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import CircularProgress from "@material-ui/core/CircularProgress";

import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { useStyles } from "../../../styles";
import { arraysEqual } from "../../../../libs/utils";
import { useDrag } from "react-dnd";
import firestore from "@google-cloud/firestore";
import { theme } from "../../../../shared/theme";

import { firestoreTimeNow } from "db";
import ElementChildren from "./Children";
import clsx from "clsx";
import { Optional } from "types";
import { CurrentEditingElementAndPath } from "components/InSpaceEditor/types";
import useElementDrop from "./useElementDrop";
import ElementIcon from "../ElementIcon";

const CreateElementNode = ({
  path,
  setCreating,
  isCreating,
}: {
  path: string[];
  setCreating: (path: string[]) => void;
  isCreating: boolean;
}) => {
  const handleCreateClicked = useCallback(() => {
    setCreating(path);
  }, [path, setCreating]);

  const [text, setText] = useState("Add New Child");

  useEffect(() => {
    if (path.length === 0) {
      setText("Add Element");
    } else {
      setText("Add Child Element");
    }
  }, [path]);

  return (
    <ListItem onClick={handleCreateClicked} button selected={isCreating}>
      <ListItemIcon>
        <AddCircleOutlineIcon />
      </ListItemIcon>
      <ListItemText id={`switch-list-label-add-new`} primary={text} />
    </ListItem>
  );
};

const getIsSelected = (outer: string[] | undefined, inner: string[]) => {
  if (!outer) return;
  return arraysEqual(outer.slice(0, inner.length), inner);
};

export const ElementLeafNode: FC<{
  root?: boolean;
  element?: ElementConfig;
  elementRef?: firestore.DocumentReference;
  parentElementIsDragging: boolean;
  elementsCollectionRef: firestore.CollectionReference;
  elementId: string | null;
  spaceId: string;
  selection?: string[];
  path: string[];
  select: (selection: Optional<CurrentEditingElementAndPath>) => void;
  setCreating: (path: string[]) => void;
  isCreating: boolean;
  showCreateNode: boolean;
  showToggle: boolean;
}> = ({
  element,
  elementRef,
  elementsCollectionRef,
  elementId,
  root,
  selection,
  spaceId,
  select,
  path,
  setCreating,
  isCreating,
  parentElementIsDragging,
  showCreateNode,
  showToggle,
}) => {
  const [active, setActive] = useState(element?.active);

  useEffect(() => {
    setActive(element?.active);
  }, [element?.active]);

  const handleToggle = useCallback(() => {
    const isActive = !active;

    setActive(isActive);
    const updates: {
      active: boolean;
      lastActive?: any;
    } = {
      active: isActive,
    };

    if (isActive) {
      updates.lastActive = firestoreTimeNow();
    }
    elementRef?.update(updates);
  }, [active, elementRef]);

  const childOrSelfSelected = useMemo(() => getIsSelected(selection, path), [
    path,
    selection,
  ]);

  const selected = useMemo(() => arraysEqual(selection, path), [
    selection,
    path,
  ]);

  const handleToggleSelectItem = useCallback(() => {
    // if clicking on currently selected element, unselect it (select its parent)
    // otherwise, select current path
    // if (root || path.length === 0) select(null);
    if (selected) select(null);
    else
      select({
        path,
        initialValues: element,
      });
  }, [path, select, selected, element]);

  const [expanded, setExpanded] = useState(root);

  useEffect(() => {
    if (childOrSelfSelected) {
      setExpanded(true);
    }
  }, [childOrSelfSelected]);

  const toggleExpanded = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const newExpanded = !expanded;
      setExpanded(newExpanded);

      if (newExpanded) {
        select({
          initialValues: element,
          path,
        });
      }
    },
    [expanded, path, select, element]
  );

  const [{ isDragging }, drag] = useDrag({
    item: { name: elementId, type: "element" },
    canDrag: !root,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const allowDrop = useCallback(() => {
    return !parentElementIsDragging && !isDragging;
  }, [isDragging, parentElementIsDragging]);

  const { isOver, canDrop, drop, isMoving } = useElementDrop({
    allowDrop,
    parentElementId: elementId,
    elementsCollectionRef,
    spaceId,
    path,
    select,
    setExpanded,
  });

  const elementStyles: {
    // opacity?: number;
    backgroundColor?: string;
    color?: string;
  } = useMemo(() => {
    if (isMoving) {
      return {
        // opacity: 0.3,
        backgroundColor: "white",
        color: "black",
      };
    }
    if (isDragging) {
      return {
        // opacity: 0.3,
        backgroundColor: "white",
        color: "black",
      };
    }
    if (selected) {
      return {
        // opacity: 1,
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
      };
    }
    if (canDrop) {
      if (isOver)
        return {
          // opacity: 1,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        };

      return {
        // opacity: 0.7,
        backgroundColor: theme.palette.primary.light,
      };
    }

    return {
      // opacity: 1,
    };
  }, [canDrop, isDragging, isOver, selected, isMoving]);

  const classes = useStyles();

  if (element?.deleted) return null;

  return (
    <>
      <ListItem
        selected={selected}
        onClick={handleToggleSelectItem}
        button
        style={elementStyles}
        className={clsx(classes.listRoot, {
          [classes.notVisible]: element?.active === false,
        })}
        ref={!canDrop ? drag : drop}
      >
        {!root && (
          <ListItemIcon onClick={toggleExpanded}>
            {!expanded && <ExpandMore htmlColor={elementStyles.color} />}
            {expanded && <ExpandLess htmlColor={elementStyles.color} />}
          </ListItemIcon>
        )}

        <ListItemIcon color={elementStyles.color}>
          <ElementIcon
            elementType={element ? element.elementType : ElementType.root}
            color={elementStyles.color}
          />
        </ListItemIcon>
        {isMoving && <CircularProgress />}
        <ListItemText
          id={`switch-list-label-${elementId}`}
          primary={element ? element.name : "root"}
        />
        {!root && element && showToggle && (
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              onChange={handleToggle}
              checked={element.active}
              inputProps={{
                "aria-labelledby": `switch-list-label-${elementId}`,
              }}
            />
          </ListItemSecondaryAction>
        )}
      </ListItem>

      {expanded && (
        <ElementChildren
          elementsCollectionRef={elementsCollectionRef}
          parentId={elementId}
          spaceId={spaceId}
          select={select}
          path={path}
          root={root}
          parentElementIsDragging={parentElementIsDragging || isDragging}
          selection={selection}
          setCreating={setCreating}
          isCreating={isCreating}
          showCreateNode={showCreateNode}
          showToggle={showToggle}
        />
      )}
      {expanded && selected && showCreateNode && (
        <div className={classes.nested}>
          <CreateElementNode
            path={path}
            setCreating={setCreating}
            isCreating={isCreating}
          />
        </div>
      )}
    </>
  );
};
