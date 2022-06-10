import firestore from "@google-cloud/firestore";
import { useEffect, useState } from "react";
import { ElementConfig } from "../spaceTypes";

export type ElementConfigs = {
  [id: string]: {
    config: ElementConfig;
    ref: firestore.DocumentReference;
  };
};

export const useElementsOfChildren = ({
  elementsCollectionRef,
  parentId,
  orderBy,
  filterInactiveOrDeleted = false,
}: {
  elementsCollectionRef: firestore.CollectionReference;
  parentId: string | null;
  orderBy?: "name";
  filterInactiveOrDeleted?: boolean;
}): ElementConfigs | undefined => {
  const [elementConfigs, setElementConfigs] = useState<
    ElementConfigs | undefined
  >();

  useEffect(() => {
    setElementConfigs(undefined);
  }, [elementsCollectionRef]);

  // subscribe to model config changes
  useEffect(() => {
    const toCompare = parentId ? parentId : null;
    let elementsChildrenRef = elementsCollectionRef.where(
      "parentId",
      "==",
      toCompare
    );

    if (orderBy) {
      elementsChildrenRef = elementsChildrenRef.orderBy("name");
    }

    const unsubscribe = elementsChildrenRef.onSnapshot((querySnapshot) => {
      setElementConfigs((existing) => {
        const updatedElementsConfigs = {
          ...existing,
        };

        querySnapshot.docChanges().forEach((change) => {
          const elementId = change.doc.id;
          if (change.type === "removed") {
            delete updatedElementsConfigs[elementId];
          } else {
            const config = change.doc.data() as ElementConfig;

            const shouldRender = config.active && !config.deleted;

            if (filterInactiveOrDeleted && !shouldRender) {
              delete updatedElementsConfigs[elementId];
            } else {
              updatedElementsConfigs[elementId] = {
                config,
                ref: change.doc.ref,
              };
            }
          }
        });

        return updatedElementsConfigs;
      });
    });

    // cleanup
    return () => {
      unsubscribe();
    };
  }, [elementsCollectionRef, filterInactiveOrDeleted, orderBy, parentId]);

  return elementConfigs;
};
