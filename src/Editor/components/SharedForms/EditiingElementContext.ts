import { createContext } from "react";

export type EditingElementStatus = {
  locked?: boolean;
};

export const EditingElementContext = createContext<EditingElementStatus | null>(
  null
);
