import React, { useCallback, MouseEvent } from "react";
import { Row, Col } from "react-bootstrap";

import styles from "../styles/entranceFlow.module.scss";
import cta from "css/cta.module.scss";
import clsx from "clsx";
import { trackClickedToInitialized } from "analytics/onboarding";

const GrantAccessDialog = ({
  headingText = "Please allow Arium to access your camera and microphone",
  close,
  spaceSlug,
  spaceId,
}: {
  headingText?: string;
  close: (skipAccess: boolean) => void;
  spaceSlug: string;
  spaceId: string;
}) => {
  const handleGrantAccessClicked = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      trackClickedToInitialized({ spaceSlug, spaceId, grantAccess: true });

      close(false);
    },
    [close, spaceSlug, spaceId]
  );

  const handleSkipClicked = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      trackClickedToInitialized({ spaceSlug, spaceId, grantAccess: false });

      close(true);
    },
    [close, spaceSlug, spaceId]
  );

  return (
    <>
      <Row>
        <Col xs={12} className="px-4 px-m-1">
          <h2 className={clsx(styles.lightText, "d-none d-md-block")}>
            {headingText}
          </h2>
          <p className={clsx(styles.lightText, "text-center text-md-left")}>
            Arium is a social experience. Select ‘Allow’ when your browser asks
            for permission to use your microphone and camera so that other
            guests can see and hear you.
          </p>
        </Col>
      </Row>
      <Row className={clsx("my-md-2")}>
        <Col xs={12}>
          <div className={clsx(cta.container, cta.bottomFixedOnSmall)}>
            <button
              onClick={handleGrantAccessClicked}
              className={cta.primary}
              id="initialize"
            >
              Join with webcam and microphone
            </button>
          </div>
        </Col>
        <Col xs={12} className={"my-md-2"}>
          <p className={clsx(styles.lightText, styles.skipLink)}>
            <a
              href="#"
              onClick={handleSkipClicked}
              title="Don't grant camera access."
            >
              Skip for now
            </a>
          </p>
        </Col>
      </Row>
    </>
  );
};

export default GrantAccessDialog;
