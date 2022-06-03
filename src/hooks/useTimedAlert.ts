import { useCallback, useState } from "react";

export type Severity = "error" | "success" | "info" | "warning";

export interface AlertAndSeverity {
  message: string;
  severity: Severity;
}

export type OpenAlert = ({ message, severity }: AlertAndSeverity) => void;

const useTimedAlert = (timeout = 4000) => {
  const [alert, setAlert] = useState<
    | {
        message: string;
        severity: Severity;
      }
    | undefined
  >();

  const [alertTimeout, setAlertTimeout] = useState<number | undefined>(
    undefined
  );

  const openAlert = useCallback(
    ({ message, severity }: { message: string; severity: Severity }) => {
      setAlert((existing) => {
        if (existing?.message === message && existing?.severity === severity)
          return existing;

        if (alertTimeout) clearTimeout(alertTimeout);

        const newTimeout = window.setTimeout(() => {
          setAlert(undefined);
        }, timeout);

        setAlertTimeout(newTimeout);

        return { message, severity };
      });
    },
    [alertTimeout, timeout]
  );

  return { alert, openAlert };
};

export default useTimedAlert;
