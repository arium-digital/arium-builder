import Button from "@material-ui/core/Button";
import { SyntheticEvent, useCallback } from "react";

import { useStyles } from "../../shared/styles";
import { useRouter } from "next/router";
import { auth } from "db";

const handleLogout = async (e: SyntheticEvent) => {
  e.preventDefault();
  await auth().signOut();
};

const LogoutButton = () => {
  const classes = useStyles();

  return (
    <Button
      color="inherit"
      onClick={handleLogout}
      className={classes.logoutButton}
    >
      Logout
    </Button>
  );
};
export const LogoutLink = ({ to }: { to: string }) => {
  const router = useRouter();
  const handleLogoutAndRedirect = useCallback(
    async (e: SyntheticEvent) => {
      await handleLogout(e);

      router.push(to);
    },
    [to, router]
  );
  return (
    <a href={to} onClick={handleLogoutAndRedirect} title="Logout">
      Logout
    </a>
  );
};

export default LogoutButton;
