import React, { FC, useCallback, useEffect, useState } from "react";

//@ts-ignore
import * as yup from "yup";
import {
  Backdrop,
  Button,
  CircularProgress,
  Fade,
  Grid,
  Hidden,
  Modal,
} from "@material-ui/core";
import { CloseIcon } from "@material-ui/data-grid";
import TextField from "@material-ui/core/TextField";
import { betaSignUpsCollection } from "shared/documentPaths";
import { useAuthentication } from "hooks/auth/useAuthentication";
import { error as logError } from "firebase-functions/lib/logger";
import styles from "css/betaaccess.module.scss";
import cta from "css/cta.module.scss";
import clsx from "clsx";
import { firestoreTimeNow } from "db";
import { trackSignedUpForBeta } from "analytics/acquisition";

const successMessage = (): Array<string> => [
  `Thank you!`,
  "We'll get back to you soon.",
];

const submissionErrorMessage = ["Something went wrong.", "Please try again."];

const nameErrorMsg = `Please enter your name`;
const emailErrorMessage = "Invalid email";

const StyledTextField: FC<{
  error: string | null;
  iconSrc: string;
  placeholder: string;
  onChange: any;
  autofocus?: boolean;
}> = ({ iconSrc, placeholder, onChange, autofocus, error }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={2} sm={1}>
        <img alt="icon" src={iconSrc} />
      </Grid>
      <Grid item xs={10}>
        <TextField
          error={error !== null}
          helperText={error}
          className={clsx(styles.textField)}
          required
          fullWidth
          autoFocus={autofocus}
          placeholder={placeholder}
          InputProps={{
            className: styles.inputLabel,
          }}
          onChange={onChange}
        />
      </Grid>
    </Grid>
  );
};

enum Status {
  pending,
  submitting,
  success,
  error,
}

const Submitted: FC<{
  name: string;
  email: string;
}> = ({ name, email }) => {
  const { authenticated } = useAuthentication({
    ensureSignedInAnonymously: false,
  });

  const [status, setStatus] = useState<Status>(Status.pending);

  useEffect(() => {
    if (!authenticated) return;
    betaSignUpsCollection()
      .add({
        name: name,
        emailAddress: email,
        signUpTime: firestoreTimeNow(),
      })
      .then(() => setTimeout(() => setStatus(Status.success), 300)) // give it a nice little tension before telling them success
      .catch((err) => {
        logError("Error when sending beta sign up info to db", err);
        setTimeout(() => setStatus(Status.error), 300);
      });
  }, [authenticated, email, name]);

  return (
    <>
      {status === Status.pending && (
        <Backdrop open={!status}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      {status === Status.success &&
        successMessage().map((line, i) => <h2 key={i}>{line}</h2>)}
      {status === Status.error &&
        submissionErrorMessage.map((line, i) => <h1 key={i}>{line}</h1>)}
    </>
  );
};

const validateName = (name: string): string | null =>
  yup.string().min(1).isValidSync(name) ? null : nameErrorMsg;

const validateEmail = (email: string): string | null =>
  yup.string().min(1).email().isValidSync(email) ? null : emailErrorMessage;

const Form: FC<{}> = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    const [nameE, emailE] = [validateName(name), validateEmail(email)];
    setEmailError(emailE);
    setNameError(nameE);
    if (emailE || nameE) return;

    trackSignedUpForBeta();

    setSubmitted(true);
  }, [name, email]);

  const handleNameChange = useCallback((e: any) => setName(e.target.value), []);

  const handleEmailChange = useCallback(
    (e: any) => setEmail(e.target.value),
    []
  );

  return submitted ? (
    <Submitted {...{ name, email }} />
  ) : (
    <>
      <p>Want your own space on Arium?</p>
      <h1>Sign up for our Beta</h1>
      <br />
      <StyledTextField
        error={nameError}
        autofocus
        iconSrc="/images/icons/name-tag-icon.svg"
        placeholder="Your Name"
        onChange={handleNameChange}
      />
      <br />
      <StyledTextField
        error={emailError}
        iconSrc="/images/icons/email-round-icon.svg"
        placeholder="Your Email"
        onChange={handleEmailChange}
      />
      <br />
      <Grid container spacing={4}>
        <Hidden xsDown>
          <Grid item sm={1}></Grid>
        </Hidden>
        <Grid item xs={12} sm={10}>
          <div className={cta.container}>
            <button onClick={handleSubmit} className={cta.primary} id="enter">
              Submit
            </button>
          </div>
        </Grid>
      </Grid>
    </>
  );
};

const BetaSignupModal: FC<{
  onClose: (e: any) => void;
  show: boolean;
}> = ({ onClose, show: open }) => {
  return !open ? null : (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={styles.modal}
      open={open}
      onClose={onClose}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <div className={styles.modalPaper}>
          <Button
            className={styles.closeButton}
            onClick={onClose}
            color="secondary"
          >
            <CloseIcon />
          </Button>
          <div className={styles.modalContent}>
            <Form />
          </div>
        </div>
      </Fade>
    </Modal>
  );
};

export default BetaSignupModal;
