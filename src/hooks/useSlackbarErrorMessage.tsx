import { Snackbar, SnackbarProps } from "@material-ui/core";
import React, { useCallback, useMemo, useState } from "react";

/**
 * @returns
 * ErrorUI: A ReactNode, render this to show the error message.
 *
 * showError: A function, which you can call to send a message to the UI. The message will display for 3 seconds.
 */
export const useSlackbarErrorMessage = (): {
  ErrorUI: React.ReactNode;
  showError: (message: string) => void;
} => {
  const handleClose = useCallback(() => {
    setSnackbar((curr) => ({ ...curr, open: false }));
  }, []);

  const [snackbar, setSnackbar] = useState<SnackbarProps>({
    open: false,
  });

  const showError = useCallback(
    (message: string) => {
      setSnackbar((curr) => ({
        ...curr,
        message,
        open: true,
        autoHideDuration: 3000,
        onClose: handleClose,
        anchorOrigin: { vertical: "top", horizontal: "center" },
      }));
    },
    [handleClose]
  );

  const ErrorUI = useMemo(() => {
    return <Snackbar {...snackbar} />;
  }, [snackbar]);

  return {
    showError,
    ErrorUI,
  };
};
