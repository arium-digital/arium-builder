import { createMuiTheme } from "@material-ui/core/styles";
import {
  primaryFont,
  ariumCream,
  ariumMustard,
  ariumRed,
  ariumMint,
  ariumBlack,
} from "css/styleVariables";

import { SpeedDialClassKey } from "@material-ui/lab/SpeedDial";
import { SpeedDialActionClassKey } from "@material-ui/lab";

declare module "@material-ui/core/styles/overrides" {
  export interface ComponentNameToClassKey {
    MuiSpeedDial: SpeedDialClassKey;
    MuiSpeedDialAction: SpeedDialActionClassKey;
  }
}

const important = (value: string) => {
  return `${value} !important`;
};

export const drawerWidth = 240;

const black = "#000000";
const white = "#fffffa";
const gray = "#303030";
const headerFont = {
  fontFamily: primaryFont,
  fontWeight: 400,
};

const editorTheme = createMuiTheme({
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
    background: {
      default: white,
      paper: white,
    },
    primary: {
      // light: will be calculated from palette.primary.main,
      main: ariumRed,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
      contrastText: ariumCream,
    },

    secondary: {
      main: gray,
      // dark: will be calculated from palette.secondary.main,
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
    MuiTooltip: {
      tooltip: {
        backgroundColor: important(black),
        fontSize: "1em",
      },
    },
    MuiSpeedDialAction: {
      fab: {
        margin: "0 8px",
      },
    },
    MuiSpeedDial: {
      fab: {
        margin: 0,
        backgroundColor: white,
        color: ariumRed,
      },
    },
    // form labels
    MuiTypography: {
      body1: {
        // fontSize: '0.9375rem',
        // fontWeight: 600
      },
    },
    // MuiGrid: {
    //   root: {
    //     border: "1px dashed #ffff0088", // debug
    //     borderRadius: "8px",
    //   },
    // },
    MuiTabs: {
      indicator: {
        backgroundColor: ariumRed,
      },
    },
    MuiTab: {
      root: {
        textTransform: "none",
        color: `${gray} !important`,
        fontWeight: "normal",
        "&.Mui-selected": {
          color: `${ariumRed} !important`,
          fontWeight: "bold",
        },
        minWidth: "50px !important",
      },
    },
    MuiAppBar: {
      root: {
        boxShadow: "none",
      },
      colorPrimary: {
        color: ariumRed,
        backgroundColor: `${white} !important`,
      },
      colorDefault: {
        color: gray,
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
      },
    },
    MuiPaper: {
      // root: {
      //   backgroundColor: "red",
      // },
      rounded: {
        borderRadius: "0px",
      },
    },
    MuiSnackbar: {
      root: {
        backgroundColor: white,
        borderRadius: "none",
      },
    },
    MuiSnackbarContent: {
      root: {
        backgroundColor: white,
        borderRadius: "none",
        color: primaryFont,
        boxShadow: important("none"),
      },
      message: {
        backgroundColor: white,
      },
    },
    MuiAccordion: {
      root: {
        "&.Mui-expanded": {
          margin: "0 0 16px",
        },
      },
      // expanded: {
      //   margin: '0 0 16px'
      // }
    },
    MuiAccordionSummary: {
      content: {
        margin: "0 !important",
      },
      expandIcon: {
        paddingTop: "0 !important",
        paddingBottom: "0 !important",
      },
    },
  },
});

export { editorTheme };
