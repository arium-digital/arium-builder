import React, { useState } from "react";
import { JoinStatus } from "../../../shared/sharedTypes";
import { Alert, Container, Row, Col } from "react-bootstrap";
import styles from "../../css/ui.module.scss";
import LoadingSpinAnimation from "./LoadingSpinAnimation";

const ErrorDialog = ({ children }: { children: React.ReactChild }) => {
  const [show, setShow] = useState(true);

  if (!show) return null;
  return (
    <Alert
      variant={"danger"}
      onClose={() => setShow(false)}
      dismissible
      className={styles.alertModal}
    >
      {children}
    </Alert>
  );
};

const FullDialog = () => (
  <ErrorDialog>
    Could not connect to space because it is full. You can still walk around the
    space, but won't be able to communicate with the others in the space.
  </ErrorDialog>
);

const ReconnectingDialog = () => (
  <ErrorDialog>
    It looks like you were disconnected from the server. Attempting to
    reconnect...
  </ErrorDialog>
);

const LoadingSpin = () => (
  <Container fluid className={styles.loadingWrapper}>
    <Row className="h-100">
      <Col xs={12} className="my-auto">
        <div className="d-flex justify-content-center">
          <LoadingSpinAnimation />
        </div>
      </Col>
    </Row>
  </Container>
);

const DisconnectedDialog = () => (
  <ErrorDialog>
    Looks like you have disconnected from the server. You can still walk around
    the space, but won't be able to communicate with the others in the space.
    You can try to reload the page to re-connect.
  </ErrorDialog>
);

const UnhandledErrorDialog = () => (
  <ErrorDialog>
    Error connecting to the server. You can still walk around the space, but
    won't be able to communicate with the others in the space. You can try to
    reload the page to re-connect.
  </ErrorDialog>
);

const JoinStatusDisplay = ({
  joinStatus,
}: {
  joinStatus: JoinStatus | undefined;
}) => {
  if (joinStatus === "full") return <FullDialog />;

  if (joinStatus === "disconnected") return <DisconnectedDialog />;

  if (joinStatus === "reconnecting")
    return (
      <>
        <ReconnectingDialog />
        <LoadingSpin />
      </>
    );

  if (joinStatus === "joined") return null;

  if (joinStatus === "error")
    return <UnhandledErrorDialog></UnhandledErrorDialog>;

  return <LoadingSpin />;
};

export default JoinStatusDisplay;
