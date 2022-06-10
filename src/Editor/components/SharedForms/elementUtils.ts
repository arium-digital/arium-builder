import { ElementType, Transform } from "../../../spaceTypes";
import { defaultOnesVector3 } from "../Form/EditVectorThree";

export const defaultTransform = (): Transform => ({
  scale: defaultOnesVector3,
});

export const getElementTypes = () =>
  Object.values(ElementType).filter((elementType) => elementType !== "root");
