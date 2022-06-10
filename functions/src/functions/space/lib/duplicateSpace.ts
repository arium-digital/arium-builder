import firebase from "firebase";
import { store, firestore } from "../../../db";
import { SpaceMeta } from "../../../../../shared/spaceMeta";

interface ElementConfig {}

interface ElementNode {
  config: ElementConfig;
  children: ElementNodes;
}

type ElementNodes = {
  [elementId: string]: ElementNode;
};

const getElementsTreeRecursive = async (
  elementsCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>
) => {
  const elements = await elementsCollection.get();

  const result: ElementNodes = {};

  await Promise.all(
    elements.docs.map(async (element) => {
      const id = element.id;
      // element config is config in this node of tree.
      const elementConfig = element.data() as ElementConfig;

      // child nodes are recursive calls to get child nodes.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const childNodes = await getElementsTreeRecursive(
        elementsCollection.doc(id).collection("elements")
      );

      const elementNode: ElementNode = {
        config: elementConfig,
        children: childNodes,
      };

      result[id] = elementNode;
    })
  );

  return result;
};

const writeElementsOfTreeRecursive = async ({
  t,
  elementsToWrite,
  elementsCollection,
}: {
  t: firebase.firestore.Transaction;
  elementsToWrite: ElementNodes;
  elementsCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
}) => {
  Object.entries(elementsToWrite).forEach(
    ([elementId, { config, children }]) => {
      // copy element doc to new collection
      const childElementDoc = elementsCollection.doc(elementId);
      t.set(childElementDoc, config);

      // recursively copy its children.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      writeElementsOfTreeRecursive({
        t,
        elementsToWrite: children,
        elementsCollection: childElementDoc.collection("elements"),
      });
    }
  );
};

const writeElements = async ({
  t,
  elementsToWrite,
  elementsCollection,
}: {
  t: FirebaseFirestore.Transaction;
  elementsToWrite: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
  elementsCollection: FirebaseFirestore.CollectionReference<firebase.firestore.DocumentData>;
}) => {
  elementsToWrite.forEach(async (element) => {
    const data = element.data();
    if (!data.deleted) {
      await elementsCollection.doc(element.id).set(data);
    }
  });
};

export const duplicateSpace = async ({
  spaceId,
  newSpaceId,
  duplicateMeta = true,
  duplicateSettings = true,
}: {
  spaceId: string;
  newSpaceId: string;
  copySpaceDoc?: boolean;
  duplicateSettings?: boolean;
  duplicateMeta?: boolean;
}) => {
  const sourceDocRef = store.collection("spaces").doc(spaceId);
  const targetDocRef = store.collection("spaces").doc(newSpaceId);

  const sourceSettingsCollectionRef = sourceDocRef.collection("settings");
  const targetSettingsCollectionRef = targetDocRef.collection("settings");

  // get entire element tree recurively.  This can't be done inside the transaction
  // becasue we query collections

  const elements = await sourceDocRef.collection("elementsTree").get();

  // in transaction:
  await store.runTransaction(async (t) => {
    const sourceSpaceDoc = await t.get(sourceDocRef);

    const sourceData = sourceSpaceDoc.data();
    if (!sourceSpaceDoc.exists || !sourceData)
      throw new Error(`No space exists with id ${spaceId}`);

    const sourceEnvironmentDoc = (
      await t.get(sourceSettingsCollectionRef.doc("environment"))
    ).data();

    const sourceMetaDoc = await t.get(sourceSettingsCollectionRef.doc("meta"));
    const sourceThemeDoc = await t.get(
      sourceSettingsCollectionRef.doc("theme")
    );
    const spacePhysicsDoc = await t.get(
      sourceSettingsCollectionRef.doc("physics")
    );
    const spaceCameraDoc = await t.get(
      sourceSettingsCollectionRef.doc("camera")
    );

    // copy space document
    if (duplicateSettings) t.set(targetDocRef, sourceData);

    // copy environment settings
    t.set(targetSettingsCollectionRef.doc("environment"), sourceEnvironmentDoc);

    if (sourceMetaDoc.exists)
      if (duplicateMeta) {
        // copy environment settings
        t.set(targetSettingsCollectionRef.doc("meta"), sourceMetaDoc.data());
      } else {
        const { metaImage } = sourceMetaDoc.data() as SpaceMeta;
        if (metaImage)
          t.set(targetSettingsCollectionRef.doc("meta"), { metaImage });
      }

    if (sourceThemeDoc.exists)
      t.set(targetSettingsCollectionRef.doc("theme"), sourceThemeDoc.data());
    if (spacePhysicsDoc.exists)
      t.set(targetSettingsCollectionRef.doc("physics"), spacePhysicsDoc.data());
    if (spaceCameraDoc.exists)
      t.set(targetSettingsCollectionRef.doc("camera"), spaceCameraDoc.data());

    // copy elements
    const targetElementsCollection = targetDocRef.collection("elementsTree");

    writeElements({
      t,
      elementsToWrite: elements,
      elementsCollection: targetElementsCollection,
    });

    // make source space files available to new space
    t.update(targetDocRef, {
      accessToSpaceAssets: firestore.FieldValue.arrayUnion(spaceId),
    });

    // TODO: firebase function to auth users in the new space - or do we need to?
    // TODO: - navigate to duplicated space?
  });

  return newSpaceId;
};
