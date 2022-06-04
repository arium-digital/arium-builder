import { createMuiTheme } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import { CSSProperties } from "@material-ui/styles";
const black = "#000000";
// const white = "#ffffff";
export const AriumWhite = "#FFFFFA";
export const AriumOrange = "#F4501B";
export const AriumLightGreen: CSSProperties["color"] = "#A9D8B4";
const darkGray = "#303030";

const important = (value: string) => {
  return `${value} !important`;
};

export const addAlpha = (colorString: string, opacity: number) => {
  if (opacity > 0.999) return colorString;
  if (opacity > 1 || opacity < 0) throw Error("opacity must be 0 - 1");
  return (
    colorString +
    Math.floor(256 * opacity)
      .toString(16)
      .padStart(2, "0")
  );
};

export const BackgroundColor = darkGray;

export const PrimaryText = AriumWhite;
export const PrimaryColor = AriumOrange;
export const SecondaryColor = darkGray;
// Create a theme instance.
export const theme = createMuiTheme({
  spacing: Array(32)
    .fill(null)
    .map((val, i) => i * 8),
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 768,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    type: "dark",
    primary: {
      main: PrimaryColor,
      contrastText: AriumWhite,
    },
    secondary: {
      main: SecondaryColor,
      contrastText: AriumWhite,
    },
    error: {
      main: red.A400,
    },
    background: {
      default: BackgroundColor,
    },
  },

  typography: {
    fontFamily: '"Secular One", sans-serif',
    h1: {
      color: PrimaryText,
      //stylename": "L / Arium H1",
      fontSize: "50px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "60px",
      letterSpacing: "-0.02em",
      textAlign: "left",

      "@media screen and (max-width:768px)": {
        "//stylename": "S / Arium H1",
        fontFamily: "Secular One",
        fontSize: "25px",
        fontStyle: "normal",
        fontWeight: 400,
        lineHeight: "35px",
        letterSpacing: "-0.02em",
        textAlign: "left",
      },
    },

    h2: {
      //styleName: "L / Arium H2"
      fontFamily: "Secular One",
      fontSize: "40px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "55px",
      letterSpacing: "0em",
      textAlign: "left",

      "@media screen and (max-width:768px)": {
        "//styleName": "S / Arium H2",
        fontFamily: "Secular One",
        fontSize: "20px",
        fontStyle: "normal",
        fontWeight: 400,
        lineHeight: "25px",
        letterSpacing: "-0.02em",
        textAlign: "left",
      },
    },
    h3: {
      "//styleName": "L / Arium H3",
      fontFamily: "Secular One",
      fontSize: "25px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "38px",
      letterSpacing: "0em",
      textAlign: "left",
      "@media screen and (max-width:768px)": {
        "//styleName": "L / Arium H3",
        fontFamily: "Secular One",
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: 400,
        lineHeight: "38px",
        letterSpacing: "0em",
        textAlign: "left",
      },
    },
    h4: {
      "//styleName": "L / Arium H4",
      fontFamily: "Secular One",
      fontSize: "20px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "30px",
      letterSpacing: "0em",
      textAlign: "left",
    },
    h5: {
      //styleName: "L / Arium H2"
      fontFamily: "Secular One",
      fontSize: "40px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "55px",
      letterSpacing: "0em",
      textAlign: "left",
    },

    body1: {
      //stylename": "L / Arium text,
      fontFamily: "Source Sans Pro",
      fontSize: "18px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "29px",
      letterSpacing: "0em",
      textAlign: "left",

      "@media screen and (max-width:768px)": {
        "//stylename": "S / Arium Text",
        fontFamily: "Source Sans Pro",
        fontSize: "16px",
        fontStyle: "normal",
        fontWeight: 400,
        lineHeight: "26px",
        letterSpacing: "0em",
        textAlign: "left",
      },
    },

    body2: {
      //styleName: "L / Arium main CTA",
      fontFamily: "Source Code Pro",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "30px",
      letterSpacing: "0em",
      textAlign: "left",
    },

    overline: {
      //styleName: "L / Arium Eyebrow",
      fontFamily: "Source Sans Pro",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 700,
      lineHeight: "18px",
      letterSpacing: "0em",
      textAlign: "left",
    },
  },

  overrides: {
    // MuiGrid: {
    //   root: {
    //     border: "1px dashed #0000ffaa", // debug
    //   },
    // },
    MuiPaper: {
      root: {
        padding: "2em",
      },
      rounded: {
        borderRadius: 10,
      },
    },
    MuiTableRow: {
      hover: {
        "&:hover": {
          backgroundColor: important(addAlpha(SecondaryColor, 0.1)),
        },
      },
    },
    MuiTableCell: {
      root: {
        borderBottom: "none",
        textOverflow: "ellipsis",
      },
    },
    MuiCssBaseline: {
      "@global": {
        "@font-face": {
          fontFamily: "'Secular One'",
          fontStyle: "normal",
          fontWeight: 400,
          fontDisplay: "swap",
          src:
            "url(https://fonts.gstatic.com/s/secularone/v5/8QINdiTajsj_87rMuMdKyqDiOOhZL4pL.woff2) format('woff2')",
          unicodeRange:
            "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
        },
        html: {
          scrollBehavior: "smooth",
          fontSize: "16px",
          outline: "none",
        },
        "&.Mui-selected": {
          outline: 0,
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        backgroundColor: important(black),
        fontSize: "0.8em",
      },
    },
    MuiButton: {
      root: {
        "//styleName": "L / Arium secondary CTA",
        fontFamily: "Secular One",
        fontSize: important("20px"),
        fontStyle: "normal",
        fontWeight: 400,
        lineHeight: "29px",
        letterSpacing: "0em",
        textAlign: "left",
        textTransform: "none",
        borderRadius: 0,
        height: "50px",
      },
    },
  },
});
