import Navbar from "react-bootstrap/Navbar";
import clsx from "clsx";
import styles from "./css/header.module.scss";
import { useAuthentication } from "hooks/auth/useAuthentication";
import CircularImageClip from "components/UserInterface/CircularImageClip";
import React, { useCallback, useEffect, useState, MouseEvent } from "react";
import { preventHighlight } from "components/utils/controls";
import BetaSignupModal from "components/BetaSignUpModal";
import { store, auth, User } from "db";
import { Space } from "../../shared/sharedTypes";
import { Nav, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { trackBetaSignupModalOpened } from "analytics/acquisition";
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

  if (!authenticated || isAnonymous) {
    return <SignUp spaceId={spaceId} />;
  }

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

// const BadgeSvg = () => (
//   <svg
//     width="34"
//     height="34"
//     viewBox="0 0 34 34"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     style={{ position: "absolute", top: "12px" }}
//   >
//     <path
//       d="M17 0L19.8276 3.69719L23.9145 1.46973L24.9939 5.99737L29.6335 5.62478L28.7779 10.2L33.168 11.7467L30.5255 15.5784L33.9069 18.777L29.9344 21.2026L31.7224 25.5L27.1068 26.1002L26.9923 30.7533L22.5316 29.4242L20.5345 33.6285L17 30.6L13.4655 33.6285L11.4684 29.4242L7.00765 30.7533L6.89323 26.1002L2.27757 25.5L4.06563 21.2026L0.0931282 18.777L3.4745 15.5784L0.832039 11.7467L5.22205 10.2L4.36654 5.62478L9.00612 5.99737L10.0855 1.46973L14.1724 3.69719L17 0Z"
//       fill="#F29F05"
//     />
//   </svg>
// );

export const SignUp = ({ spaceId }: { spaceId?: string }) => {
  const [showModal, setShowModal] = useState(false);

  const openBetaSignupModule = useCallback((e: React.SyntheticEvent) => {
    preventHighlight(e);
    setShowModal(true);
    trackBetaSignupModalOpened();
  }, []);

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!spaceId) {
      setShow(false);
      return;
    }

    (async () => {
      const spaceDoc = await store.collection("spaces").doc(spaceId).get();
      if (!spaceDoc.exists) setShow(true);

      const space = spaceDoc.data() as Space;

      const show = space.promoteArium === true;

      setShow(show);
    })();
  }, [spaceId]);

  if (!show) return null;

  return (
    <>
      <Nav.Item>
        <Nav.Link href={`/`} className="mx-3" onClick={openBetaSignupModule}>
          <span className="mx-1" style={{ textTransform: "none" }}>
            Want your own space?
          </span>
        </Nav.Link>
      </Nav.Item>
      <BetaSignupModal
        onClose={(e) => {
          setShowModal(false);
        }}
        show={showModal}
      />
    </>
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
