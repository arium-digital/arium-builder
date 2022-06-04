import { QuerySnapshot } from "@google-cloud/firestore";
import { CollectionReference } from "@google-cloud/firestore";
import { store } from "db";
import { useEffect, useMemo, useState } from "react";
import { ElementConfig } from "spaceTypes";
import { ElementNode } from "spaceTypes/Element";

type Configs = { [elementId: string]: ElementConfig };

export type Node = {
  configs: Configs;
  numInitialChildren: number;
};

export type ElementsAndParentsWithCount = {
  [parentId: string]: Node;
};

export type ElementsAndParentsWithTotalCount = {
  elements: ElementsAndParentsWithCount;
  initialCount: number;
  initialElements: Set<string>;
};

export const rootId = "root";

const parseInitialTree = (snapshot: QuerySnapshot) => {
  return Array.from(snapshot.docChanges())
    .filter((x) => x.type !== "removed")
    .reduce((acc: ElementsAndParentsWithCount, current) => {
      const config = current.doc.data() as ElementNode;

      if (config.active === false || config.deleted) return acc;

      const parentId = config.parentId || rootId;

      const existingNode: Node = acc[parentId] || {
        numInitialChildren: 0,
        configs: {},
      };

      const id = current.doc.id;

      const newConfigs = {
        ...existingNode.configs,
        [id]: config,
      };

      const newNode: Node = {
        configs: newConfigs,
        numInitialChildren: Object.keys(newConfigs).length,
      };

      return {
        ...acc,
        [parentId]: newNode,
      };
    }, {});
};

function parseInitialCount(
  elements: ElementsAndParentsWithCount,
  parentNode: string
): number {
  const countForElement = parentNode === rootId ? 0 : 1;
  const node = elements[parentNode];

  if (!node) return countForElement;

  return (
    Object.keys(node.configs).reduce((total, elementId) => {
      const childCount = parseInitialCount(elements, elementId);

      return total + childCount;
    }, 0) + countForElement
  );
}

function parseInitialSet(
  elements: ElementsAndParentsWithCount,
  parentNode: string
): Set<string> {
  const setForElement =
    parentNode === rootId ? new Set<string>() : new Set([parentNode]);
  const node = elements[parentNode];

  if (!node) return setForElement;

  Object.keys(node.configs).forEach((elementId) => {
    const childSet = parseInitialSet(elements, elementId);

    Array.from(childSet.values()).forEach((child) => setForElement.add(child));
  });

  return setForElement;
}

function applyChangesToTree({
  existing,
  snapshot,
}: {
  existing: ElementsAndParentsWithCount;
  snapshot: QuerySnapshot<FirebaseFirestore.DocumentData>;
}): ElementsAndParentsWithCount {
  return Array.from(snapshot.docChanges()).reduce(
    (acc: ElementsAndParentsWithCount, current) => {
      const config = current.doc.data() as ElementNode;
      const remove =
        current.type === "removed" ||
        config.active === false ||
        !!config.deleted;

      const parentId = config.parentId || rootId;

      let toUpdateConfigs: Configs = {
        ...(acc[parentId]?.configs || {}),
      };

      const id = current.doc.id;

      if (remove) {
        delete toUpdateConfigs[id];
      } else {
        toUpdateConfigs = {
          ...toUpdateConfigs,
          [id]: config,
        };
      }

      const node: Node = {
        configs: toUpdateConfigs,
        numInitialChildren: acc[parentId]?.numInitialChildren || 0,
      };

      return {
        ...acc,
        [parentId]: node,
      };
    },
    existing
  );
}

const useElementsTree = ({ spaceId }: { spaceId: string }) => {
  const elementsCollectionRef = useMemo(
    () =>
      (store
        .collection("spaces")
        .doc(spaceId)
        .collection("elementsTree") as unknown) as CollectionReference,
    [spaceId]
  );

  const [
    elementsAndParentsWithCount,
    setElementsAndParentsWithCount,
  ] = useState<ElementsAndParentsWithTotalCount>();

  useEffect(() => {
    // reset elements and parent with count on space id changed
    setElementsAndParentsWithCount(undefined);
    const unsubscribe = elementsCollectionRef.onSnapshot((snapshot) => {
      setElementsAndParentsWithCount((existing) => {
        if (!existing) {
          // initial load
          const elements = parseInitialTree(snapshot);

          const initialCount = parseInitialCount(elements, rootId);

          const initialSet = parseInitialSet(elements, rootId);

          return {
            elements,
            initialCount,
            initialElements: initialSet,
          };
        }

        const elements = applyChangesToTree({
          existing: existing.elements,
          snapshot,
        });

        return {
          ...existing,
          elements,
        };
      });
    });

    return () => unsubscribe();
  }, [elementsCollectionRef]);

  return elementsAndParentsWithCount;
};

export default useElementsTree;
