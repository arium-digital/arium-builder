import { createMuiTheme } from "@material-ui/core/styles";
import {
  primaryFont,
  ariumCream,
  ariumMustard,
  ariumRed,
  ariumMint,
  ariumBlack,
} from "css/styleVariables";

export const drawerWidth = 240;

const black = "#000000";

const headerFont = {
  fontFamily: primaryFont,
  fontWeight: 600,
};

const theme = createMuiTheme({
  typography: {
    fontFamily: primaryFont,
    h1: headerFont,
    h2: headerFont,
    h3: headerFont,
    h4: headerFont,
    h5: headerFont,
    h6: headerFont,
    button: headerFont,
  },
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: ariumRed,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
      contrastText: ariumCream,
    },
    secondary: {
      main: ariumMustard,
      // dark: will be calculated from palette.secondary.main,
      contrastText: black,
    },
    success: {
      main: ariumMint,
      contrastText: black,
    },
    error: {
      main: ariumRed,
      contrastText: ariumCream,
    },
    warning: {
      main: ariumMustard,
      contrastText: black,
    },

    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,
  },
  overrides: {
    MuiAppBar: {
      root: {
        width: `calc(100% - ${drawerWidth}px)`,
      },
      colorPrimary: {
        backgroundColor: `${ariumBlack} !important`,
      },
      colorDefault: {
        backgroundColor: `${ariumBlack} !important`,
      },
      colorSecondary: {
        backgroundColor: `${ariumBlack} !important`,
      },
    },
    MuiFormControl: {
      root: {
        margin: "default",
        minWidth: "default",
      },
    },
    MuiListItemIcon: {
      root: {
        minWidth: 40,
      },
    },
    MuiButton: {
      root: {
        textTransform: "none",
        minWidth: "auto",
      },
    },
  },
});

export { theme };
