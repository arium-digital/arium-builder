import * as THREE from "three";
import { store } from "../../../../db";
import { toNonNullVector3, asIVector3, last } from "../../../../libs/utils";
import { ElementConfig } from "../../../../spaceTypes";

const getElementConfig = async ({
  id,
  spaceId,
}: {
  id: string;
  spaceId: string;
}) => {
  const data = (
    await store
      .collection("spaces")
      .doc(spaceId)
      .collection("elementsTree")
      .doc(id)
      .get()
  ).data();

  if (!data) throw new Error(`could not get data for id ${id}`);

  const elementConfig = data as ElementConfig;
  const parentId = data.parentId as string | undefined;

  return {
    elementConfig,
    parentId,
  };
};

const getElementAndParentConfigs = async ({
  elementId,
  spaceId,
}: {
  elementId: string;
  spaceId: string;
}): Promise<ElementConfig[]> => {
  const { elementConfig, parentId } = await getElementConfig({
    id: elementId,
    spaceId,
  });

  if (parentId) {
    const parentConfigs = await getElementAndParentConfigs({
      elementId: parentId,
      spaceId,
    });

    return [...parentConfigs, elementConfig];
  }

  return [elementConfig];
};

const defaultPosition = {
  x: 0,
  y: 0,
  z: 0,
};

const defaultScale = {
  x: 1,
  y: 1,
  z: 1,
};

const defaultRotation = defaultPosition;

const buildGraph = async ({
  elementId,
  spaceId,
  scene,
}: {
  elementId: string;
  spaceId: string;
  scene: THREE.Scene;
}): Promise<{
  object: THREE.Object3D;
  config: ElementConfig;
}> => {
  const elementAndParentConfigs = await getElementAndParentConfigs({
    elementId,
    spaceId,
  });

  let lastElement: THREE.Object3D = scene;

  elementAndParentConfigs.forEach((elementConfig, i) => {
    const element = new THREE.Object3D();
    const { transform } = elementConfig;
    if (transform) {
      if (transform.position) {
        element.position.set(
          ...toNonNullVector3(transform.position, defaultPosition)
        );
      }
      if (transform.scale) {
        element.scale.set(...toNonNullVector3(transform.scale, defaultScale));
      }
      if (transform.rotation) {
        element.rotation.set(
          ...toNonNullVector3(transform.rotation, defaultRotation)
        );
      }
    }

    // if first element (root) - add to scene graph
    lastElement.add(element);

    lastElement = element;
  });

  if (!lastElement) throw new Error("could not build element tree");

  return {
    object: lastElement,
    config: last(elementAndParentConfigs) as ElementConfig,
  };
};

export const getUpdatedTransform = async ({
  newParentId,
  elementId,
  spaceId,
}: {
  newParentId: string | null;
  elementId: string;
  spaceId: string;
}) => {
  // get element and parents
  const scene = new THREE.Scene();

  // build scene graph by inserting element under parents.
  const {
    object: existingObjectForElement,
    config: elementConfig,
  } = await buildGraph({
    elementId,
    spaceId,
    scene,
  });

  let newParentForElement: THREE.Object3D;

  if (!newParentId) {
    newParentForElement = scene;
  } else {
    const newGraph = await buildGraph({
      elementId: newParentId,
      spaceId,
      scene,
    });

    newParentForElement = newGraph.object;
  }

  // update scene graph and all descendents to update transforms
  scene.updateMatrixWorld(true);

  newParentForElement.attach(existingObjectForElement);

  const result = {
    position: asIVector3(existingObjectForElement.position),
    rotation: asIVector3(existingObjectForElement.rotation),
    scale: asIVector3(existingObjectForElement.scale),
  };

  return {
    transform: result,
    elementConfig,
  };
};
