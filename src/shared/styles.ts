import { makeStyles, Theme } from "@material-ui/core/styles";
import { drawerWidth } from "./theme";

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  notVisible: {
    opacity: "0.5 !important",
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },

  logoutButton: {
    display: "flex",
  },
  button: {
    margin: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  paperHeader: {
    marginBottom: "0.5em",
  },
  dataGrid: {
    backgroundColor: "#ffffff",
  },
  listRoot: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    paddingTop: "0 !important",
    paddingBottom: "0 !important",
    marginTop: "0 !important",
    marginBottom: "0 !important",
  },
  listItem: {
    paddingTop: "0 !important",
    paddingBottom: "0 !important",
    marginTop: "0 !important",
    marginBottom: "0 !important",
  },
  nested: {
    paddingLeft: `${theme.spacing(1)}px !important` as any,
    paddingTop: "0 !important",
    paddingBottom: "0 !important",
    marginTop: "0 !important",
    marginBottom: "0 !important",
  },
  gridRoot: {
    flexGrow: 1,
  },
  formRoot: {
    flexWrap: "wrap",
  },
  textField: {
    width: "25ch",
  },

  numberFieldSmall: {
    width: "6.2ch",
  },
  numberFieldMedium: {
    width: "15ch",
  },
  numberFieldLarge: {
    width: "25ch",
  },
  numberFieldExtraLarge: {
    width: "50ch",
  },
  fullWidth: {
    width: "100%",
  },

  formRow: {
    marginBottom: theme.spacing(1),
    width: "100%",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  formControlLarge: {
    margin: theme.spacing(1),
    minWidth: 200,
  },
  buttonLabel: {
    marginBottom: theme.spacing(1),
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  fieldMargin: {
    margin: theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
  previewImage: {
    width: "100%",
    pointerEvents: "none",
  },
  transparentUntilHover: {
    opacity: 0,
    "&:hover": {
      opacity: 1,
    },
  },
  grouped: {
    margin: theme.spacing(0.5),
    border: "none",
    "&:not(:first-child)": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:first-child": {
      borderRadius: theme.shape.borderRadius,
    },
  },
  icon: {
    verticalAlign: "bottom",
    height: 20,
    width: 20,
  },
  details: {
    alignItems: "center",
  },
  column: {
    flexBasis: "33.33%",
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2),
  },
  accordionHeading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: 600,
  },
  accordionSecondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
}));
