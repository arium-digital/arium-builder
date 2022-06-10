import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { useStyles } from "../../shared/styles";
import LogoutButton from "../../shared/components/LogoutButton";

const TopNav = () => {
  const classes = useStyles();
  return (
    <AppBar position="fixed" classes={{ root: classes.appBar }}>
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          Admin
        </Typography>
        <LogoutButton />
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
