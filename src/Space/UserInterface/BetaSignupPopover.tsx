import React, { useCallback, useEffect, useState, useRef } from "react";

import { Col, Row, Form } from "react-bootstrap";
import { store } from "../../db";
import clsx from "clsx";
import { firestoreTimeNow, User } from "db";

import styles from "../../css/controls.module.scss";
import cta from "css/cta.module.scss";

const addBetaSignUp = async ({
  user,
  email,
}: {
  user: User;
  email: string;
}) => {
  const timestamp = firestoreTimeNow();
  await store.collection("betaSignUps").add({
    emailAddress: email,
    signUpTime: timestamp,
  });
};

export const BetaSignupPopover = ({
  user,
  setKeyboardControlsDisabled,
}: {
  user: User;
  setKeyboardControlsDisabled: (disabled: boolean) => void;
}) => {
  const [isLoading, setLoading] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const unfocusRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<any>(null);
  const [editing, setEditing] = useState(false);

  const doneEditing = useCallback(() => {
    emailInputRef.current?.blur();
    unfocusRef.current?.focus();
    setEditing(false);
  }, []);

  useEffect(() => {
    if (editing) {
      setTimeout(() => {
        document.addEventListener("click", doneEditing);
      }, 100);

      return () => {
        document.removeEventListener("click", doneEditing);
      };
    }
  }, [editing, doneEditing]);

  useEffect(() => {
    setKeyboardControlsDisabled(editing);
  }, [editing, setKeyboardControlsDisabled]);

  const handleDoneTyping = useCallback(() => {
    setEditing(false);
  }, []);

  const handleTyping = useCallback(() => {
    setEditing(true);
  }, []);

  const handleKeyPressed = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        doneEditing();
      }
    },
    [doneEditing]
  );

  const handleClicked = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (!formRef.current) return;
    if (formRef.current.checkValidity() === false) return;

    if (isLoading && emailInputRef.current && nameInputRef.current && user) {
      const email = emailInputRef.current.value;
      // const name = nameInputRef.current.value;
      addBetaSignUp({ user, email }).then(() => {
        setLoading(false);
      });
    }
  }, [isLoading, user]);

  const handleClick = () => setLoading(true);

  return (
    <Form ref={formRef}>
      {/* @ts-ignore */}
      <Form.Group as={Row} controlId="email">
        <Form.Label srOnly className="sign-up-form" column sm={4}>
          Your Email
        </Form.Label>
        <Col sm={12}>
          <Form.Control
            className="sign-up-form"
            required
            type="email"
            placeholder={"hello@youremail.com"}
            onClick={handleClicked}
            onFocus={handleTyping}
            onBlur={handleDoneTyping}
            onKeyPress={handleKeyPressed}
            ref={emailInputRef}
          />
        </Col>
      </Form.Group>
      <input
        type="text"
        ref={unfocusRef}
        style={{ height: "0", width: "0", opacity: 0 }}
      ></input>
      <Row className="justify-content-center">
        <div className={clsx(cta.container, styles.signUpCta)}>
          <button
            className={cta.primary}
            disabled={isLoading}
            onClick={
              !isLoading
                ? handleClick
                : () => {
                    return undefined;
                  }
            }
          >
            Sign Up!
          </button>
        </div>
      </Row>
    </Form>
  );
};
