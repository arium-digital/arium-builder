import React, { useCallback, useState, FC, useMemo } from "react";
import {
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";

export type DialogConfig = {
  title: string;
  content?: string;
};

export type WithConfirmationDialogProps = {
  children: React.ReactElement<ButtonProps>[];
  dialogConfig: DialogConfig;
  open?: boolean;
};

/**
 *
 * @param children: Please pass at least 2 buttons as children in the following order:
 *
 * 1, trigger button, which will trigger displaying the dialog.
 * 2, 3, 4... any number of action buttons, they will be show up on the right/bottom of the cancel button,
 *
 * @param open: force open ?
 */

const WithConfirmationDialog: FC<WithConfirmationDialogProps> = ({
  children,
  open,
  dialogConfig: { content, title },
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const handleClose = useCallback(() => setShowDialog(false), []);
  const handleOpen = useCallback(() => setShowDialog(true), []);

  const [trigger, actions] = useMemo(() => {
    const [trigger, ...actions] = children;
    return [
      React.cloneElement(trigger, {
        onClick: (e: any) => {
          trigger.props.onClick && trigger.props.onClick(e);
          handleOpen();
        },
      }),
      actions.map((action, i) =>
        React.cloneElement(action, {
          key: i,
          onClick: (e: any) => {
            action.props.onClick && action.props.onClick(e);
            handleClose();
          },
        })
      ),
    ];
  }, [children, handleOpen, handleClose]);
  return (
    <>
      {trigger}
      <Dialog
        open={open === undefined ? showDialog : open}
        onEscapeKeyDown={handleClose} // todo: fix this
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>{actions.map((action) => action)}</DialogActions>
      </Dialog>
    </>
  );
};

export default WithConfirmationDialog;
