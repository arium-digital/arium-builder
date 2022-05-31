import Header, { SignUpHeader } from "./header";
import Footer from "./footer";
import { Container, Col, Row } from "react-bootstrap";
import websiteStyles from "./css/websiteStyles";
import styles from "./css/layout.module.scss";
import { useEffect, useState } from "react";
import { useAuthentication } from "hooks/auth/useAuthentication";
import Login from "./components/Login";

export default function Layout({
  children,
  format = "space",
  requireAuth,
}: {
  children?: any;
  format?: "signUpFlow" | "space";
  requireAuth?: boolean;
}) {
  const [accessState, setAccessState] = useState<
    "loading" | "authorized" | "unauthorized"
  >("loading");

  const {
    authenticated,
    isAnonymous,
    userId,
    isNewUser,
    pending,
  } = useAuthentication({ ensureSignedInAnonymously: false });

  useEffect(() => {
    if (pending) return;
    if (!requireAuth) {
      setAccessState("authorized");
      return;
    }

    if (!authenticated || isAnonymous) {
      setAccessState("unauthorized");
      return;
    }

    setAccessState("authorized");
  }, [pending, authenticated, isAnonymous, requireAuth]);

  return (
    <>
      <style jsx global>
        {websiteStyles}
      </style>

      <Container className={styles.main}>
        {format === "signUpFlow" && <SignUpHeader />}
        {format === "space" && <Header />}

        <Container className={styles.mainContainer}>
          <Row>
            {accessState === "authorized" && <Col xs={12}>{children}</Col>}
            {accessState === "unauthorized" && (
              <Col xs={12}>
                <Login userId={userId} isNewUser={isNewUser} />
              </Col>
            )}
          </Row>
        </Container>

        <Footer />
      </Container>
    </>
  );
}
