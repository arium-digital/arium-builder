import { useCallback, useEffect, useState } from "react";

import { useDrop } from "react-dnd";
import firestore from "@google-cloud/firestore";
import { getUpdatedTransform } from "../utils/transform";
import { ElementConfig } from "spaceTypes";
import { CurrentEditingElementAndPath } from "Space/InSpaceEditor/types";
import { Optional } from "types";

const useElementDrop = ({
  elementsCollectionRef,
  parentElementId,
  spaceId,
  path,
  select,
  allowDrop,
  setExpanded,
}: {
  elementsCollectionRef: firestore.CollectionReference;
  parentElementId: string | null;
  spaceId: string;
  path: string[];
  select: (selected: Optional<CurrentEditingElementAndPath>) => void;
  allowDrop: () => boolean;
  setExpanded?: (expanded: boolean) => void;
}) => {
  const [isMoving, setIsMoving] = useState(false);

  const onDrop = useCallback(
    async ({ name: id }: { name: string }) => {
      // console.log('on drop', { elementConfig: !!elementConfig })
      setIsMoving(true);

      const { transform, elementConfig } = await getUpdatedTransform({
        newParentId: parentElementId,
        elementId: id,
        spaceId,
      });

      elementsCollectionRef.doc(id).update({
        parentId: parentElementId,
        transform,
      });
      setIsMoving(false);

      if (setExpanded) setExpanded(true);

      const newPath = [...path, id];

      const newElementConfig: ElementConfig = {
        ...elementConfig,
        transform,
      };

      select(null);
      setTimeout(() => {
        select({
          path: newPath,
          initialValues: newElementConfig,
        });
      }, 100);
    },
    [parentElementId, spaceId, elementsCollectionRef, setExpanded, path, select]
  );

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "element",
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    drop: onDrop,
    canDrop: allowDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  useEffect(() => {
    if (isOver) console.log({ isOver, canDrop, allowDrop, path });
  }, [isOver, canDrop, allowDrop, path]);

  return {
    isOver,
    canDrop,
    drop,
    isMoving,
  };
};

export default useElementDrop;
