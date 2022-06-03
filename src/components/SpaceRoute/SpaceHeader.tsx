import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import clsx from "clsx";
import styles from "website/css/header.module.scss";
import { HasAuthenticatedAuthState } from "hooks/auth/useAuthentication";
import React, { useCallback, useContext } from "react";
import { SpaceAccessContext } from "hooks/auth/useSpaceAccess";

import { EditorState, EditorStatus } from "components/InSpaceEditor/types";
import { useIsEditorOpen } from "components/InSpaceEditor/hooks/useEditorStatus";
import {
  LoginStatus,
  LogoFull,
  LogoLetter,
  ShortcutsTooltip,
} from "website/header";

const SpaceHeader = ({
  spaceId,
  spaceSlug,
  authState,
  editorState,
}: { spaceId: string } & HasAuthenticatedAuthState & {
    editorState: EditorState | null;
    spaceSlug: string;
  }) => {
  const spaceAccess = useContext(SpaceAccessContext);
  const canEdit = !!spaceAccess?.canEdit;

  const { authenticated, isAnonymous, user } = authState;

  const editorIsOpen = useIsEditorOpen(editorState?.status$);
  const activeEditor = useCallback(() => {
    if (canEdit && editorState)
      editorState.setStatus(EditorStatus.selectingElement);
  }, [canEdit, editorState]);

  return (
    <>
      <Navbar className={clsx(styles.topSpaceNavbar)} variant="dark">
        <LogoFull className="d-none d-lg-block" />
        <LogoLetter className="d-lg-none" />
        {/* // for now hide menu on mobile */
        /* // Hide menubar in edit mode */}
        <>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto">
              {!editorIsOpen && (
                <>
                  {canEdit && (
                    <Nav.Item onClick={activeEditor}>
                      <ShortcutsTooltip>
                        <Nav.Link className="mx-md-3">Edit this Space</Nav.Link>
                      </ShortcutsTooltip>
                    </Nav.Item>
                  )}
                </>
              )}
              {authenticated && (
                <LoginStatus
                  authenticated={authenticated}
                  isAnonymous={isAnonymous}
                  user={user}
                  showLogin={false}
                  spaceId={spaceId}
                />
              )}
            </Nav>
          </Navbar.Collapse>
        </>
      </Navbar>
    </>
  );
};

export default SpaceHeader;
