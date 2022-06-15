import React, { useCallback, useEffect, useMemo, useState } from "react";
import useSpaceImage from "hooks/useSpaceImage";
import { Row, Col, Button } from "react-bootstrap";
import { Card } from "react-bootstrap";
import Link from "next/link";
import styles from "../css/flow.module.scss";
import { useRouter } from "next/router";
import { useAuthentication } from "hooks/auth/useAuthentication";
import { Layout2 } from "website/Layout/Layout2";
import { spaceDoc } from "shared/documentPaths";
import { useSpaceAccess } from "hooks/auth/useSpaceAccess";
import SpaceUrlFormWrapper from "Editor/components/SpaceSettings/SpaceUrlForm";
import cta from "css/cta.module.scss";
import { ariumOrange } from "css/styleVariables";
import Typography from "@material-ui/core/Typography";

const SpaceCreated = ({ spaceId }: { spaceId: string }) => {
  const spaceImage = useSpaceImage(spaceId);

  const [spaceSlug, setSpaceSlug] = useState<string>();

  useEffect(() => {
    if (!spaceId) return;
    const unsub = spaceDoc(spaceId).onSnapshot((snap) => {
      if (snap.exists) {
        const slug = snap.data()?.slug as string | undefined;
        setSpaceSlug(slug);
      } else {
        setSpaceSlug(undefined);
      }
    });

    return () => unsub();
  }, [spaceId]);

  const router = useRouter();

  const spaceLink = useMemo(() => `/spaces/${spaceSlug}`, [spaceSlug]);
  const spaceLinkEditMode = useMemo(() => spaceLink + "?editMode=true", [
    spaceLink,
  ]);

  const visitSpace = useCallback(() => {
    router.push(spaceLinkEditMode);
  }, [router, spaceLinkEditMode]);

  const [updatingSlug, setUpdatingSlug] = useState(false);

  // const editSpace = useCallback(() => {
  //   router.push(`/editor/${spaceId}/space-settings`);
  // }, [spaceId, router]);

  return (
    <Layout2 navProps={{ navItems: ["my-spaces"] }}>
      <Typography variant="h4" align="center">
        Your Space has Been Created
      </Typography>
      <Row className="justify-content-md-center">
        <Col xs={12} md={8} lg={8}>
          <Card className={styles.card}>
            {spaceImage && (
              <>
                {updatingSlug && (
                  <Card.Img src={spaceImage} alt={spaceId} variant="top" />
                )}
                {!updatingSlug && (
                  <Link href={spaceLink}>
                    <Card.Img
                      src={spaceImage}
                      alt={spaceId}
                      variant="top"
                      style={{ cursor: "pointer" }}
                    />
                  </Link>
                )}
              </>
            )}
            <Card.Body>
              <div style={{ margin: "auto", textAlign: "center" }}>
                <Card.Title>
                  {spaceSlug && (
                    <p style={{ fontSize: "0.9em" }}>
                      <SpaceUrlFormWrapper
                        spaceId={spaceId}
                        initialSlug={spaceSlug}
                        prefix="space url:"
                        setUpdating={setUpdatingSlug}
                      />
                    </p>
                  )}
                </Card.Title>
              </div>
              <div
                className={cta.container}
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  width: "400px",
                  marginTop: 24,
                }}
              >
                <Button
                  onClick={visitSpace}
                  variant="primary"
                  className={cta.primary}
                  style={{ backgroundColor: ariumOrange, fontWeight: "bold" }}
                  key="select"
                  disabled={updatingSlug}
                >
                  Enter this Space
                </Button>
              </div>
              {/* <Button
                onClick={editSpace}
                variant="info"
                className={styles.cardFooterButton}
                key="select"
              >
                Edit Space
              </Button> */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout2>
  );
};

const SpaceCreatedWrapper = ({ spaceId }: { spaceId: string }) => {
  const authState = useAuthentication({
    ensureSignedInAnonymously: false,
    forceRefreshToken: true,
  });

  useSpaceAccess({
    ...authState,
    spaceId,
  });

  if (!authState.authenticated) return null;

  return <SpaceCreated spaceId={spaceId} />;
};

export default SpaceCreatedWrapper;

// TODO: refresh token on space creation
// LIMIT # of spaces person can create.
// Mark invite as used
// Only allow creation of space for invited users.
// make other space assets available to the dropdown.
