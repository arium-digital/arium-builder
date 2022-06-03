import {
  Backdrop,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Grid,
  Hidden,
  IconButton,
  Modal,
  ModalProps,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useCallback, useState } from "react";
import styles from "./styles.module.scss";
import {
  IconBetaSignUp,
  Centered,
  DivGrow,
  getImgSrcAndSet,
  useIsSmallScreen,
} from "./utils";
import * as yup from "yup";
import { useFormik } from "formik";
import { AriumCloseIcon } from "./Icons";
import Fade from "@material-ui/core/Fade";
import { error as logError } from "firebase-functions/lib/logger";
import { betaSignUpsCollection } from "shared/documentPaths";
import { firestoreTimeNow } from "db";
import { useAuthentication } from "hooks/auth/useAuthentication";
import { Skeleton } from "@material-ui/lab";
import { useBetaSignUpAnalytics } from "./useLandingPageAnalytics";
import clsx from "clsx";

const BODY_DESKTOP =
  "We are currently in private beta and granting limited access; let us know a bit about what you'd like to use Arium for and we will get back to you with more information.";
const BODY_MOBILE = "Let us know what you'd like to use Arium for";

const { imgSrc, imgSrcSet } = getImgSrcAndSet("formImg", "jpg");

type FormData = {
  email: string;
  name: string;
  eventDescription: string;
  optInMarketing: boolean;
};
const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  name: yup.string().optional(),
  eventDescription: yup.string().optional(),
  optInMarketing: yup.boolean().optional(),
});

const saveToDB = (vals: FormData): Promise<void> => {
  return new Promise((res, rej) =>
    betaSignUpsCollection()
      .add({
        name: vals.name,
        emailAddress: vals.email,
        eventDescription: vals.eventDescription,
        optInMarketing: vals.optInMarketing,
        signUpTime: firestoreTimeNow(),
      })
      .then(() => {
        setTimeout(res, 300);
      })
      .catch((err) => {
        logError("Error when sending beta sign up info to db", err);
        setTimeout(() => rej(err), 300);
      })
  );
};

const Submitted = () => {
  return (
    <Grid container alignItems="center" className={styles.fullSize}>
      <Centered>
        <Typography variant="h1" align="center">
          <br />
          <br />
          Thank you!
          <br />
          We'll be in touch soon.
          <br />
          <br />
          <br />
        </Typography>
      </Centered>
    </Grid>
  );
};

const useTypeWrapper = () =>
  useFormik<FormData>({
    initialValues: {
      email: "",
      name: "",
      eventDescription: "",
      optInMarketing: false,
    },
    onSubmit: () => {},
  });
const TheForm = ({
  saving,
  formik,
}: {
  saving: boolean;
  formik: ReturnType<typeof useTypeWrapper>;
}) => {
  const smallScreen = useIsSmallScreen();
  return (
    <>
      <Typography variant="h2" gutterBottom>
        Want your own space or to host an event?
      </Typography>
      <Typography variant="body1">
        {smallScreen ? BODY_MOBILE : BODY_DESKTOP}
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <FormGroup>
          <br />
          <TextField
            id="name"
            onChange={formik.handleChange}
            placeholder="Your name"
            value={formik.values.name}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name ? formik.errors.name : ""}
          />
          <br />
          <TextField
            id="email"
            placeholder="Email"
            onChange={formik.handleChange}
            value={formik.values.email}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email ? formik.errors.email : ""}
          />
          <br />
          <TextField
            id="eventDescription"
            onChange={formik.handleChange}
            placeholder="Tell us a bit more about your ideal space or event"
            value={formik.values.eventDescription}
            error={
              formik.touched.eventDescription &&
              Boolean(formik.errors.eventDescription)
            }
            helperText={
              formik.touched.eventDescription
                ? formik.errors.eventDescription
                : ""
            }
          />
          <br />
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.optInMarketing}
                onChange={formik.handleChange}
                id="optInMarketing"
                color="primary"
              />
            }
            label="Send me events and updates from Arium."
          />
          <br />
        </FormGroup>
        <Button type="submit">
          {saving ? (
            <CircularProgress size="small" />
          ) : (
            <>
              <IconBetaSignUp /> Submit
            </>
          )}
        </Button>
      </form>
    </>
  );
};

const FormLayout = ({
  handleSetSubmitted,
}: {
  handleSetSubmitted: (values: FormData) => void;
}) => {
  const { authenticated } = useAuthentication({
    ensureSignedInAnonymously: true,
  });
  const [saving, setSaving] = useState(false);
  const formik = useFormik<FormData>({
    initialValues: {
      name: "",
      email: "",
      eventDescription: "",
      optInMarketing: false,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setSaving(true);
      saveToDB(values)
        .then(() => {
          handleSetSubmitted(values);
          setSaving(false);
        })
        .catch((error) => {
          console.error(error);
          setSaving(false);
        });
    },
  });
  return (
    <>
      <Grid container alignItems="center" className={styles.fullSize}>
        <DivGrow />
        <Grid item xs={12} md={5}>
          {!authenticated ? (
            <Skeleton>
              <TheForm saving={saving} formik={formik} />
            </Skeleton>
          ) : (
            <TheForm saving={saving} formik={formik} />
          )}
        </Grid>
        <DivGrow />
        <Hidden smDown>
          <Grid item md={5} className={styles.media}>
            <img
              src={imgSrc}
              srcSet={imgSrcSet}
              alt="screenshot of an Arium event"
            />
          </Grid>
        </Hidden>
      </Grid>
    </>
  );
};
export const FormModal = ({
  open,
  onClose,
  handleClose,
}: Pick<ModalProps, "open" | "onClose"> & { handleClose: () => void }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Partial<FormData>>();
  const onSubmitted = useCallback((formContent: FormData) => {
    setSubmitted(true);
    setFormData(formContent);
  }, []);

  useBetaSignUpAnalytics(open, submitted, formData);
  return (
    <Modal
      closeAfterTransition
      BackdropProps={{ className: styles.backdrop, timeout: 500 }}
      BackdropComponent={Backdrop}
      className={styles.ctaModal}
      open={open}
      onClose={onClose}
    >
      <Fade in={open} timeout={500}>
        <div className={clsx(styles.modalContainer, styles.modalPaper)}>
          <IconButton className={styles.closeButton} onClick={handleClose}>
            <AriumCloseIcon />
          </IconButton>
          {open && !submitted && (
            <FormLayout handleSetSubmitted={onSubmitted} />
          )}
          {open && submitted && <Submitted />}
        </div>
      </Fade>
    </Modal>
  );
};
