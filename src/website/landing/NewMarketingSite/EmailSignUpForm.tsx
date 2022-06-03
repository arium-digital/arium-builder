import { FormGroup, Typography } from "@material-ui/core";
import { TextFieldWithFormIK } from "components/EventRoute/EventLandingPage";
import {
  EventRegistrationStatus,
  useEventRegistrationForm,
} from "components/EventRoute/useEventRegistrationForm";
import { LoadingLinear } from "components/Loading";
import { useAuthentication } from "hooks/auth/useAuthentication";
import React from "react";
import { useEventRegistrationAnalytics } from "./useLandingPageAnalytics";

const EMAIL_SUBMITTED_TITLE = "Thank you,";
const EMAIL_SUBMITTED_BODY = "we'll get back to you with a reminder.";
const EMAIL_SUBMIT_ERROR = "Something went wrong, please try again.";

export const EmailSignUp = ({ subtitle }: { subtitle?: string }) => {
  const { authenticated } = useAuthentication({
    ensureSignedInAnonymously: true,
  });
  const { formik, status } = useEventRegistrationForm(
    "marketing-site",
    true,
    false
  );

  useEventRegistrationAnalytics(
    status === EventRegistrationStatus.saved,
    formik.values.email
  );

  if (!authenticated) return <LoadingLinear />;

  if (status === EventRegistrationStatus.saving)
    return <LoadingLinear height="160px" />;
  if (status === EventRegistrationStatus.error)
    return (
      <Typography variant="h3" align="center">
        {EMAIL_SUBMIT_ERROR}
      </Typography>
    );
  if (status === EventRegistrationStatus.saved)
    return (
      <>
        <Typography variant="h3" align="center">
          {EMAIL_SUBMITTED_TITLE}
        </Typography>
        <Typography variant="body1" align="center">
          {EMAIL_SUBMITTED_BODY}
        </Typography>
      </>
    );

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormGroup>
        {subtitle && <Typography variant="h4">{subtitle}</Typography>}
        <TextFieldWithFormIK formik={formik} color={"secondary"} />
      </FormGroup>
    </form>
  );
};
