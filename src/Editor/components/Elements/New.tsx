import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { ElementSchema } from "Editor/formAndSchema";
import { useValidateAndCreate } from "Editor/hooks/updateAndCreate";
import { useCallback, useState } from "react";
import { store } from "../../../db";
import { stripUndefined } from "../../../libs/utils";
import { ElementConfig, ElementType } from "../../../spaceTypes";
import { useStyles } from "../../styles";
import ElementForm from "./ElementForm";
import { PushUndoItemFunction } from "Editor/hooks/useUndo";
import { useEffect } from "react";
import { trackCreatedElement } from "analytics/hosts";
import { CurrentEditingElementAndPath } from "components/InSpaceEditor/types";

const defaultElementConfig = (): ElementConfig => ({
  active: true,
  // @ts-ignore
  elementType: null,
  name: "",
});

export const saveNewElement = async (
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

  trackCreatedElement({
    elementType: newElement.elementType,
    userInterface: "advanced",
  });

  pushUndoItem && pushUndoItem(pushedRef, {}, toInsert, true);
  const newId = pushedRef.id;

  return {
    path: [...path, newId],
    ref: pushedRef,
  };
};

function makeElementConfigForType(elementType: ElementType): ElementConfig {
  return {
    active: true,
    elementType,
    name: elementType,
  };
}

const New = ({
  spaceId,
  path,
  done,
}: {
  spaceId: string;
  path: string[];
  done: (newPath: CurrentEditingElementAndPath) => void;
}) => {
  const [creating, setCreating] = useState(false);
  const handleSave = useCallback(
    async (newElement: ElementConfig) => {
      setCreating(true);
      const saveElement = await saveNewElement(spaceId, path, newElement);

      setCreating(false);
      done({
        path: saveElement.path,
        initialValues: newElement,
      });
    },
    [done, path, spaceId]
  );

  const { nestedForm } = useValidateAndCreate({
    schema: ElementSchema,
    initial: defaultElementConfig,
    handleSave,
  });

  useEffect(() => {
    if (nestedForm?.values.elementType) {
      const elementConfig = makeElementConfigForType(
        nestedForm.values.elementType
      );
      handleSave(elementConfig);
    }
  }, [nestedForm?.values.elementType, handleSave]);

  const classes = useStyles();

  return (
    <div style={{ opacity: creating ? 0.5 : 1 }}>
      <Paper className={classes.paper}>
        <Typography variant="h4">Create new Element</Typography>
      </Paper>

      {nestedForm && (
        <>
          <ElementForm
            nestedForm={nestedForm}
            spaceId={spaceId}
            disableTypeChanged={creating}
          />
        </>
      )}
    </div>
  );
};

export default New;
