import { useRef } from "react";

let uniqueId = 0;
const getUniqueId = () => uniqueId++;

export const useComponentId = (): number => {
  const idRef = useRef(getUniqueId());
  return idRef.current;
};
