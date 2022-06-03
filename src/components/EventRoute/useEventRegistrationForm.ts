import { useFormik } from "formik";
import { eventRegistrationsCollection } from "shared/documentPaths";
import * as yup from "yup";
import { error as logError } from "firebase-functions/lib/logger";
import { firestoreTimeNow } from "db";
import { useState } from "react";
import { EventRegistrationState } from "hooks/useEventAnalytics";
type FormData = {
  email: string;
};

export enum EventRegistrationStatus {
  notSaved,
  saving,
  saved,
  error,
}
const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const saveToDB = (vals: {
  email: string;
  similarEvents: boolean;
  eventReminder: boolean;
  eventId: string;
}): Promise<void> => {
  return new Promise((res, rej) =>
    eventRegistrationsCollection()
      .add({
        ...vals,
        submitTime: firestoreTimeNow(),
      })
      .then((result) => {
        setTimeout(res, 300);
      })
      .catch((err) => {
        logError("Error when sending beta sign up info to db", err);
        setTimeout(() => rej(err), 300);
      })
  );
};
export const useEventRegistrationForm = (
  eventId: string,
  similarEvents: boolean,
  eventReminder: boolean,
  onSubmitEmail?: (state: EventRegistrationState) => void
) => {
  const [status, setStatus] = useState(EventRegistrationStatus.notSaved);
  const formik = useFormik<FormData>({
    initialValues: {
      email: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setStatus(EventRegistrationStatus.saving);

      saveToDB({ email: values.email, similarEvents, eventReminder, eventId })
        .then(() => {
          onSubmitEmail &&
            onSubmitEmail({
              email: values.email,
              optInAriumUpdates: similarEvents,
              eventReminder,
            });
          setStatus(EventRegistrationStatus.saved);
        })
        .catch((error) => {
          console.error(error);
          setStatus(EventRegistrationStatus.error);
        });
    },
  });

  return { formik, status };
};
