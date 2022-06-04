import Navbar from "react-bootstrap/Navbar";
import clsx from "clsx";
import styles from "./css/header.module.scss";
import { useAuthentication } from "hooks/auth/useAuthentication";
import CircularImageClip from "Space/UserInterface/CircularImageClip";
import React, { useCallback, useState, MouseEvent } from "react";
import { auth, User } from "db";
import { Nav, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { Optional } from "types";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
// import { ariumCream } from "css/styleVariables";
// import { borderRadius } from "react-select/src/theme";
import { useRouter } from "next/router";

export const LogoLetter = ({
  className = null,
}: {
  className?: string | null;
}) => (
  <Navbar.Brand className={clsx(styles.text, className)} href="/">
    <img
      src="/images/arium-logo-light.png"
      alt="Arium"
      width="75"
      height="75"
      className="d-inline-block align-top"
    />
  </Navbar.Brand>
);

export const LogoFull = ({ className }: { className?: string | null }) => (
  <Navbar.Brand className={clsx(styles.text, className)} href="/">
    <img
      src="/images/arium-logo-full.svg"
      alt="Arium"
      height="50"
      className="d-inline-block align-top"
    />
  </Navbar.Brand>
);

const SignUpLink = () => (
  <Nav.Link className={clsx(styles.text, "mx-3")} href="/account">
    Sign Up
  </Nav.Link>
);

const Header = () => {
  return (
    <Navbar className={styles.topNavbar} variant="dark">
      <LogoLetter />
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link className={clsx(styles.text, "mx-md-3")} href="/">
            About
          </Nav.Link>
          <Nav.Link className={clsx(styles.text, "mx-md-3")} href="/pricing">
            Pricing
          </Nav.Link>
          <SignUpLink />
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export const handleLogout = async (e: React.SyntheticEvent) => {
  e.preventDefault();
  await auth().signOut();
};

export const UserInfo = ({ user }: { user: User }) => {
  return (
    <Nav.Item className="align-self-center">
      {/* <Nav.Link href="/profile"> */}
      {user.photoURL && (
        <CircularImageClip
          imageUrl={user.photoURL}
          alt={user.displayName || user.email || ""}
          width={25}
          className={clsx(styles.photo, "mx-md-3")}
        />
      )}
      {/* {user.displayName || user.email} */}
      {/* </Nav.Link> */}
    </Nav.Item>
  );
};

export const LoginStatus = ({
  authenticated,
  isAnonymous,
  user,
  showLogin = true,
  spaceId,
  classNameOverride,
}: {
  authenticated: boolean;
  isAnonymous: boolean;
  user?: Optional<User>;
  showLogin?: boolean;
  spaceId?: string;
  classNameOverride?: string;
}) => {
  const router = useRouter();
  const goToYourSpaces = useCallback(() => {
    router.push("/my-spaces");
  }, [router]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {user && <UserInfo user={user} />}

      <Nav.Item
        className={clsx("align-self-center", styles.dropDownArrowHolder)}
      >
        <IconButton
          aria-label="delete"
          onClick={handleClick}
          className={styles.dropDownArrow}
          size="medium"
        >
          {!anchorEl && <ArrowDropDownIcon />}
          {anchorEl && <ArrowDropUpIcon />}
        </IconButton>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          // classes={styles.dropDownMenu}
          style={{
            // position: 'relative',
            top: 40,
            background: "none",
            borderRadius: 0,
          }}
        >
          {/* <MenuItem onClick={handleClose}>Profile</MenuItem> */}
          <MenuItem onClick={goToYourSpaces}>your spaces</MenuItem>
          <MenuItem onClick={handleLogout}>logout</MenuItem>
        </Menu>
        {/* <DropdownButton align="end" title="blah" id="dropdown-menu-align-end" style={styles.dropDownArrow}>
          <Dropdown.Item eventKey="1">Your Spaces</Dropdown.Item>
          <Dropdown.Item eventKey="2" href="/logout"
            onClick={handleLogout}
          >Logout</Dropdown.Item>
        </DropdownButton> */}
      </Nav.Item>
      {/* <Nav.Item>
        <Nav.Link
          className={clsx(
            classNameOverride ? classNameOverride : styles.text,
            "mx-md-3"
          )}
          href="/logout"
          onClick={handleLogout}
        >
          Logout
        </Nav.Link>
      </Nav.Item> */}
    </>
  );
};

export const SignUpHeader = ({ spaceId }: { spaceId?: string }) => {
  const { authenticated, isAnonymous, user } = useAuthentication({
    ensureSignedInAnonymously: false,
  });

  return (
    <Navbar className={styles.topNavbar} variant="dark">
      <LogoFull />
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          {/* <Nav.Link className={clsx(styles.text, "mx-3")} href="/">
            About
          </Nav.Link>
          <Nav.Link className={clsx(styles.text, "mx-3")} href="/pricing">
            Pricing
          </Nav.Link>
          <SignUpLink /> */}
          <LoginStatus
            authenticated={authenticated}
            isAnonymous={isAnonymous}
            user={user}
            spaceId={spaceId}
          />
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

const shortcuts: Array<[string, string]> = [
  ["p", "Position info"],
  ["t", "Edit mode"],
  ["ctrl + i", "Performance"],
];

export const ShortcutsTooltip = ({
  children,
}: {
  children: React.ReactElement;
}): JSX.Element => (
  <OverlayTrigger
    placement="bottom"
    overlay={
      <Tooltip id="tooltip-shortcuts" className={styles.tooltipShortcuts}>
        <Table size="sm" borderless className="text-left mb-0">
          <thead>
            <tr>
              <th colSpan={2}>Shortcuts</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map(([keyStroke, description]) => (
              <tr key={keyStroke}>
                <td>
                  <strong>{keyStroke}</strong>
                </td>
                <td>{description}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Tooltip>
    }
  >
    {children}
  </OverlayTrigger>
);

export default Header;
