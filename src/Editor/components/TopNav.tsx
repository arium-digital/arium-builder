import { useState, ChangeEvent } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStyles } from "../styles";
import FormControl from "@material-ui/core/FormControl";
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from "@material-ui/core/styles";
import InputBase from "@material-ui/core/InputBase";
import NativeSelect from "@material-ui/core/NativeSelect";
import { useRouter } from "next/router";
import LogoutButton from "../../shared/components/LogoutButton";
import { ariumCream } from "css/styleVariables";
import { useSpaceSlugsForIds } from "hooks/useSpaceIdForSlug";

const BootstrapInput = withStyles((theme: Theme) =>
  createStyles({
    root: {
      "label + &": {
        marginTop: theme.spacing(3),
      },
    },
    input: {
      borderRadius: 4,
      position: "relative",
      backgroundColor: theme.palette.background.paper,
      border: "1px solid #ced4da",
      fontSize: 16,
      padding: "10px 26px 10px 12px",
      fontWeight: "bold",
      transition: theme.transitions.create(["border-color", "box-shadow"]),
      // Use the system font instead of the default Roboto font.
      "&:focus": {
        borderRadius: 4,
        borderColor: "#80bdff",
        boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
      },
    },
  })
)(InputBase);

const spaceSelectStyles = makeStyles((theme: Theme) => ({
  spaceSelector: {
    position: "relative",
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    color: "#ffffff",
    lineHeight: "58px",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
      flexGrow: 1,
    },
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const SpaceSelect = ({
  editableSpaces,
  spaceSlug,
  section,
}: {
  editableSpaces: string[];
  spaceSlug: string;
  section: string;
}) => {
  const router = useRouter();

  const spaceSlugs = useSpaceSlugsForIds(editableSpaces);

  const [selectedSpace, setSelectedSpace] = useState(spaceSlug);

  const classes = spaceSelectStyles();
  const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
    const newSpaceSlug = event.target.value as string;
    setSelectedSpace(newSpaceSlug);
    router.push(`/editor/${newSpaceSlug}/${section}`);
  };

  return (
    <div className={classes.spaceSelector}>
      Editing Space
      <FormControl className={classes.formControl}>
        <NativeSelect
          value={spaceSlug}
          onChange={handleChange}
          input={<BootstrapInput />}
        >
          {spaceSlugs.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.slug}
            </option>
          ))}
        </NativeSelect>
      </FormControl>
      <a
        href={`/spaces/${selectedSpace}`}
        style={{ fontWeight: "bold", color: ariumCream, marginLeft: 10 }}
      >
        visit this space &gt;&gt;
      </a>
    </div>
  );
};

const TopNav = ({
  editableSpaces,
  spaceSlug,
  section,
}: {
  editableSpaces: string[];
  spaceSlug: string;
  section: string;
}) => {
  const classes = useStyles();

  return (
    <AppBar position="fixed" classes={{ root: classes.appBar }}>
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          <img
            src="/images/arium-logo-full.svg"
            alt="Arium"
            height="50"
            className="d-inline-block align-top"
          />
        </Typography>
        <SpaceSelect
          editableSpaces={editableSpaces}
          spaceSlug={spaceSlug}
          section={section}
        />
        <LogoutButton />
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
