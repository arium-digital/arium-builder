import ThemeProvider from "@material-ui/styles/ThemeProvider";
import styles from "../dialog.module.scss";
import { AriumCloseIcon } from "website/landing/NewMarketingSite/Icons";
import Fade from "@material-ui/core/Fade";
import { lightTheme } from "website/themes/lightTheme";
import clsx from "clsx";
import IconButton from "@material-ui/core/IconButton";
import { ReactChild } from "react";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";

const ModalDialog = ({
  open,
  handleClose,
  children,
  size,
  backdropDisabled = false,
}: {
  open: boolean;
  handleClose: () => void;
  children: ReactChild;
  size: "small" | "large";
  backdropDisabled?: boolean;
}) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <Modal
        closeAfterTransition
        BackdropProps={{
          className: clsx({ [styles.backdrop]: !backdropDisabled }),
          timeout: 500,
        }}
        BackdropComponent={backdropDisabled ? undefined : Backdrop}
        open={open}
        onClose={handleClose}
        className={clsx(styles.modal)}
      >
        <Fade in={open} timeout={500}>
          <div
            className={clsx({
              [styles.modalPaperSmaller]: size === "small",
              [styles.modalPaperLarge]: size === "large",
            })}
          >
            <IconButton className={styles.closeButton} onClick={handleClose}>
              <AriumCloseIcon />
            </IconButton>
            {children}
          </div>
        </Fade>
      </Modal>
    </ThemeProvider>
  );
};

export default ModalDialog;
