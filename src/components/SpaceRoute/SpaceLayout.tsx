import { EditorState } from "components/InSpaceEditor/types";
import { HasAuthenticatedAuthState } from "hooks/auth/useAuthentication";
import React, { ReactChild } from "react";
import { Container } from "react-bootstrap";
import { HasPlayerLocationObservable } from "types";
import SpaceHeader from "./SpaceHeader";

const SpaceLayout = ({
  children,
  spaceId,
  spaceSlug,
  showHeader,
  authState,
  hideUI,
  editorState,
  playerLocation$,
}: {
  children: ReactChild;
  spaceId: string;
  spaceSlug: string;
  showHeader: boolean;
  hideUI?: boolean;
  editorState: EditorState | null;
} & HasAuthenticatedAuthState &
  HasPlayerLocationObservable) => {
  return (
    <>
      <Container fluid style={{ width: "100%", height: "100%", padding: 0 }}>
        {showHeader && !hideUI && (
          <SpaceHeader
            spaceId={spaceId}
            spaceSlug={spaceSlug}
            authState={authState}
            editorState={editorState}
          />
        )}
        <div
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            top: 0,
          }}
        >
          {children}
        </div>
      </Container>
    </>
  );
};

export default SpaceLayout;
