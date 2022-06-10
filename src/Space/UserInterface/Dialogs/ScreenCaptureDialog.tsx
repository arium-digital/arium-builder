import { ModalProps } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import styles from "./dialog.module.scss";
import cta from "css/cta.module.scss";

import randomString from "random-string";
import ModalDialog from "./shared/ModalDialog";

const ShareDialog = ({
  open,
  // onClose,
  handleClose,
  screenshotDataUri,
  spaceSlug,
}: // spaceSlug,
Pick<ModalProps, "open"> & {
  handleClose: () => void;
  screenshotDataUri: string | undefined;
  spaceSlug: string;
}) => {
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>();

  useEffect(() => {
    // new data uri will cause a re-generation of this file name
    const newFileName = `arium-screenshot-${spaceSlug}-${randomString({
      length: 4,
    }).toLowerCase()}.jpg`;

    setScreenshotFileName(newFileName);
  }, [spaceSlug, screenshotDataUri]);

  return (
    <ModalDialog open={open} handleClose={handleClose} size="large">
      <>
        <div className={styles.modalBody}>
          {screenshotDataUri && (
            <img
              src={screenshotDataUri}
              alt="Screenshot"
              className={styles.screenshotImage}
            />
          )}
        </div>
        <div
          className={cta.container}
          style={{ width: "300px", top: "10px", left: 0, margin: "10px 0" }}
        >
          <a
            href={screenshotDataUri}
            download={screenshotFileName}
            className={cta.primary}
          >
            Download
          </a>
        </div>
      </>
    </ModalDialog>
  );
};

export default ShareDialog;
