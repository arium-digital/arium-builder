import { useTheme } from "@material-ui/core";

export const usePrimaryColor = () => {
  return useTheme().palette.primary.main;
};
