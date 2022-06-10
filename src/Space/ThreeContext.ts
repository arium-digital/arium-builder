import { createContext } from "react";
import { ThreeContextType } from "types";

const ThreeContext = createContext<ThreeContextType | null>(null);

export default ThreeContext;
