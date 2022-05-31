import { Box, Button, IconButton } from "@material-ui/core";
import SpacePreview from "components/SpacePreview";
import React, { useCallback, useState } from "react";
import Modal from "react-bootstrap/Modal";
import styles from "website/css/flow.module.scss";
import { AriumCloseIcon } from "website/home/Icons";
import { LoadingLinear } from "components/Loading";
import { Centered, IconBetaSignUp } from "website/home/utils";
import cta from "css/cta.module.scss";
import { usePrimaryColor } from "website/themes/hooks";
import { SpaceTemplateConfig } from "./types";
import { ariumOrange } from "css/styleVariables";

export const PreviewModal = ({
  show,
  onClose,
  createSpace,
  space,
  space: { spaceId, title: spaceName },
  creating,
}: {
  show: boolean;
  onClose: () => void;
  createSpace: (spaceId: string) => void;
  space: SpaceTemplateConfig;
  creating: boolean;
}) => {
  const [
    fullScreenElement,
    setFullScreenElement,
  ] = useState<HTMLElement | null>(null);

  const handleSelectSpace = useCallback(() => {
    createSpace(space.spaceId);
  }, [createSpace, space]);

  const primaryColor = usePrimaryColor();

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="xl"
      className={styles.modal}
    >
      <Modal.Body className={styles.modalBody}>
        <Box position="absolute" top="8px" right="8px">
          <IconButton onClick={onClose} disabled={creating}>
            <AriumCloseIcon />
          </IconButton>
        </Box>
        <div className={styles.previewContainer} ref={setFullScreenElement}>
          {show && fullScreenElement && (
            <SpacePreview
              spaceId={spaceId}
              fullScreenElement={fullScreenElement}
            />
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Centered>
          <>
            {!creating && (
              <div
                className={cta.container}
                style={{ margin: "auto", width: "75%" }}
              >
                <button
                  onClick={handleSelectSpace}
                  className={cta.primary}
                  style={{ backgroundColor: ariumOrange, fontWeight: "bold" }}
                  id="enter"
                  disabled={creating}
                >
                  {spaceId === "empty"
                    ? "Create an empty space"
                    : `Create a space using the ${spaceName} template`}
                </button>
              </div>
            )}
            {creating && <LoadingLinear width="100%" />}
          </>
        </Centered>
        <Centered>
          <Button
            onClick={onClose}
            color="inherit"
            disabled={creating}
            style={{ margin: "auto", opacity: creating ? 50 : 100 }}
          >
            <IconBetaSignUp color={primaryColor} />
            <span style={{ fontSize: "16px" }}>
              Choose a different template
            </span>
          </Button>
        </Centered>
      </Modal.Footer>
    </Modal>
  );
};
