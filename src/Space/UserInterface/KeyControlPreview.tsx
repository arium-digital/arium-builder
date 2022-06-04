import { Col, Row } from "react-bootstrap";

import styles from "../../css/keyControlPreview.module.scss";

import clsx from "clsx";

import React, { useEffect, useState } from "react";

export const WASDKeys = () => {
  const [keysPressed, setKeysPressed] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
  });
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "w" || e.key === "ArrowUp") {
        setKeysPressed({ ...keysPressed, w: true });
      }
      if (e.key === "a" || e.key === "ArrowLeft") {
        setKeysPressed({ ...keysPressed, a: true });
      }
      if (e.key === "s" || e.key === "ArrowDown") {
        setKeysPressed({ ...keysPressed, s: true });
      }
      if (e.key === "d" || e.key === "ArrowRight") {
        setKeysPressed({ ...keysPressed, d: true });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keysPressed]);

  useEffect(() => {
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "w" || e.key === "ArrowUp") {
        setKeysPressed({ ...keysPressed, w: false });
      }
      if (e.key === "a" || e.key === "ArrowLeft") {
        setKeysPressed({ ...keysPressed, a: false });
      }
      if (e.key === "s" || e.key === "ArrowDown") {
        setKeysPressed({ ...keysPressed, s: false });
      }
      if (e.key === "d" || e.key === "ArrowRight") {
        setKeysPressed({ ...keysPressed, d: false });
      }
    }
    window.addEventListener("keyup", onKeyUp);
    return () => window.removeEventListener("keyup", onKeyUp);
  }, [keysPressed]);

  return (
    <Col sm={12}>
      <Row className="justify-content-center">
        <Col sm={3} className="p-0 m-0">
          <KeyIcon theKey={"W"} isPressed={keysPressed["w"]} />
        </Col>
      </Row>
      <Row className="justify-content-center pt-2 pb-2 m-0">
        <Col sm={3} className="p-0 m-0">
          <KeyIcon theKey={"A"} isPressed={keysPressed["a"]} />
        </Col>
        <Col sm={3} className="p-0 m-0">
          <KeyIcon theKey={"S"} isPressed={keysPressed["s"]} />
        </Col>
        <Col sm={3} className="p-0 m-0">
          <KeyIcon theKey={"D"} isPressed={keysPressed["d"]} />
        </Col>
      </Row>
    </Col>
  );
};

const KeyIcon = ({
  theKey,
  isPressed,
}: {
  theKey: string;
  isPressed: boolean;
}) => {
  return (
    <Row className="justify-content-center">
      <div className={clsx(styles.keyIconContainer, "p-0 m-0")}>
        <div
          className={clsx(
            styles.keyIconLabelVerticalAlignmentContainer,
            isPressed ? styles.keyIconPressed : ""
          )}
        >
          <div
            className={clsx(
              styles.keyIconLabel,
              isPressed ? styles.keyIconLabelPressed : ""
            )}
          >
            {theKey}
          </div>
        </div>
        <div
          className={clsx(
            styles.keyIconShadow,
            isPressed ? styles.keyIconShadowPressed : ""
          )}
        ></div>
      </div>
    </Row>
  );
};
