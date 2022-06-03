import React from "react";

import { Jumbotron, Row, Col, Button } from "react-bootstrap";
import styles from "css/ui.module.scss";

const FailedStreamDialog = ({
  dismissWarning,
}: {
  dismissWarning: () => void;
}) => {
  return (
    <Row className="justify-content-md-center vh-100">
      <Col xs="8" md="6" className="align-self-center">
        <Jumbotron className={styles.intro}>
          <h2 className="title">
            Uh Oh! (Failed to Access Webcam Audio or Video)
          </h2>
          <p>
            Your browser is unable to access your camera or microphone. You may
            still enter Arium, but other guests will not be able to see or hear
            you. To fix this, please do the following: grant this site
            permission to use your microphone and camera, turn off any
            ad-blockers you use, and reload the page.
          </p>
          <div id="enter-button-container">
            <Button
              variant="primary"
              onClick={dismissWarning}
              className="enter-button"
            >
              Dismiss
            </Button>
          </div>
        </Jumbotron>
      </Col>
    </Row>
  );
};

export default FailedStreamDialog;
