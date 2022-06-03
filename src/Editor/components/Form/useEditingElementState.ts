import { useContext } from "react";
import { EditingElementContext } from "../Elements/EditiingElementContext";

export const useEditingElementStatus = () => {
  const values = useContext(EditingElementContext);

  const locked = values?.locked;

  return { locked };
};
