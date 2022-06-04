import React from "react";
import layout from "../../css/space.module.scss";
import styles from "../../css/helpOverlay.module.scss";
import clsx from "clsx";
import { Row, Col } from "react-bootstrap";
import { WASDKeys } from "./KeyControlPreview";

export const HelpOverlay = () => {
  return (
    <>
      <div className={clsx(styles.helpOverlay, layout.fullScreenContainer)}>
        <Row className="align-items-end justify-content-center vh-100">
          <Col lg={4} xl={3} className="mb-5">
            <Row className="justify-content-center">
              <img
                className={styles.mouseIcon}
                src={"/images/icons/mouse-icon.png"}
                alt={"use the mouse to look around"}
              />
            </Row>
            <Row className="justify-content-center">
              <p className={styles.instructions}>
                Click and drag to look around!
              </p>
            </Row>
          </Col>
          <Col lg={4} xl={3} className="mb-5">
            <Row className="justify-content-center">
              <Col sm={6}>
                {/* <img
                className={styles.arrowsIcon}
                src={"/images/icons/keys-icon.png"}
                alt={"use the arrow keys to move"}
              /> */}
                <WASDKeys />
              </Col>
            </Row>
            <Row className="justify-content-center">
              <p className={styles.instructions}>Use the arrow keys to move!</p>
            </Row>
          </Col>
        </Row>
      </div>
    </>
  );
};
