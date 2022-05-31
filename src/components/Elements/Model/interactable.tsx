import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  memo,
  useMemo,
  useContext,
} from "react";
import { IModalWrapperProps, IModelInteractionProps, MediaSize } from "./types";
import parse from "html-react-parser";
import CloseIcon from "@material-ui/icons/Close";
import Button from "@material-ui/core/Button";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { AssetDetailFileType, InteractionType } from "spaceTypes/interactable";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import { useSubscription } from "hooks/useSubscription";
import { ElementType, FileLocation } from "spaceTypes";
import clsx from "clsx";
import Grid from "@material-ui/core/Grid";
import AssetDetails from "./AssetDetails";
import useResizeObserver from "use-resize-observer";
import classes from "./interactionModal.module.scss";
import { getModuleColumnSizes, getMediaElementSize } from "./utils";
import modalClasses from "css/modal.module.scss";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import { InteractableContext } from "hooks/useInteractable";
import NonTransformedHtml from "components/utils/NonTransformedHtml";

const errorMessage = `
<p>Failed loading content.</p>
`;

const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <Button className={classes.closeButton} onClick={onClose}>
    <CloseIcon />
  </Button>
);

export const TransitionsModal = memo(
  ({
    markup,
    assetDetailsFile,
    assetDetailsFileType,
    onClose,
    show: open,
    bgColor,
    contentVerticalAlignment = "center",
  }: {
    markup: string | JSX.Element | undefined | null;
    assetDetailsFile?: FileLocation;
    assetDetailsFileType?: AssetDetailFileType;
    bgColor: string;
    onClose: () => void;
    show: boolean;
    contentVerticalAlignment?: "top" | "center";
  }) => {
    const [markupParseError, setMarkupParseError] = useState(0);

    const showAssetDetails = !!assetDetailsFile;

    const [containerSize, setContainerSize] = useState<MediaSize>();

    const handleResize = useCallback(
      (size: { width: number | undefined; height: number | undefined }) => {
        setContainerSize(size);
      },
      []
    );

    const ref = useRef<HTMLDivElement>(null);

    useResizeObserver<HTMLDivElement>({ ref, onResize: handleResize });

    useLayoutEffect(() => {
      setContainerSize(ref.current?.getBoundingClientRect());
    }, [ref]);

    const [mediaSize, setMediaSize] = useState<MediaSize>();

    const [mediaElementSize, setMediaElementSize] = useState<MediaSize>({
      width: undefined,
      height: undefined,
    });

    useEffect(() => {
      const mediaElementSize = getMediaElementSize({
        mediaSize,
        containerHeight: containerSize?.height,
        containerWidth: containerSize?.width,
      });
      setMediaElementSize(mediaElementSize);
    }, [containerSize, mediaSize]);

    const columnSizes = useMemo(
      () => getModuleColumnSizes({ showAssetDetails }),
      [showAssetDetails]
    );

    return !open ? null : (
      <Modal
        disablePortal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={clsx(modalClasses.modal, "modal-container")}
        open={open}
        onClose={onClose}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div
            className={clsx(
              modalClasses.modalPaper,
              showAssetDetails
                ? classes.modalPaperWithDetails
                : classes.modalPaperWithoutDetails
            )}
            style={{ background: bgColor }}
          >
            <div className={classes.modelScrollingWrapper}>
              <div className={classes.closeBtn}>
                <CloseButton onClose={onClose} />
              </div>

              <Grid container className={modalClasses.modalContainer}>
                {assetDetailsFile && (
                  <Grid
                    item
                    {...columnSizes.details}
                    ref={ref}
                    className={clsx(classes.detailsColumn, classes.assetColumn)}
                  >
                    <AssetDetails
                      fileLocation={assetDetailsFile}
                      fileType={assetDetailsFileType}
                      mediaElementSize={mediaElementSize}
                      handleMediaSizeChanged={setMediaSize}
                      containerSize={containerSize}
                    />
                  </Grid>
                )}

                {markup && markup !== "" && (
                  <Grid
                    item
                    {...columnSizes.text}
                    className={clsx(
                      classes.detailsColumn,
                      classes.contentColumn,
                      {
                        [classes.padText]: showAssetDetails,
                        [classes.contentColumnCenter]:
                          contentVerticalAlignment === "center",
                      }
                    )}
                  >
                    <div className={classes.contentContents}>
                      {typeof markup === "string" && (
                        <ErrorBoundary
                          FallbackComponent={ErrorFallback}
                          onError={() => {
                            setMarkupParseError((prev) => prev + 1);
                          }}
                        >
                          {markupParseError > 2
                            ? parse(errorMessage)
                            : parse(markup)}
                        </ErrorBoundary>
                      )}
                      {typeof markup !== "string" && markup}
                    </div>
                  </Grid>
                )}
              </Grid>
            </div>
          </div>
        </Fade>
      </Modal>
    );
  }
);

const ErrorFallback: React.ComponentType<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error?.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};

const ShowModal = ({
  elementType,
  elementFile,
  modalConfig,
  show,
  onClose,
}: IModalWrapperProps) => {
  const [actualAssetDetailType, ActualAssetDetialFile] = useMemo<
    [AssetDetailFileType | undefined, FileLocation | undefined]
  >(() => {
    if (modalConfig.detailFileType === "self") {
      let assetDetailType: AssetDetailFileType | undefined = undefined;
      if (elementType === ElementType.image) assetDetailType = "image";
      else if (elementType === ElementType.video) assetDetailType = "video";
      else if (elementType === ElementType.model) assetDetailType = "model";

      return [assetDetailType, elementFile];
    }
    return [modalConfig.detailFileType, modalConfig.detailFile];
  }, [
    elementFile,
    elementType,
    modalConfig.detailFile,
    modalConfig.detailFileType,
  ]);

  if (show)
    return (
      <NonTransformedHtml>
        <TransitionsModal
          markup={modalConfig.contentHTML}
          bgColor={modalConfig.backgroundColor}
          assetDetailsFile={
            modalConfig.showDetail ? ActualAssetDetialFile : undefined
          }
          assetDetailsFileType={actualAssetDetailType}
          onClose={onClose}
          show={show}
          contentVerticalAlignment={modalConfig.contentVerticalAlignment}
        />
      </NonTransformedHtml>
    );

  return null;
};

const ModelInteraction = ({
  elementType,
  elementFile,
  onModalOpen,
  onModalClose,
  interactionConfig,
}: IModelInteractionProps) => {
  const [showModal, setShowModal] = useState(false);

  const spaceContext = useContext(SpaceContext);

  const setModalOpen = spaceContext?.setModalOpen;

  const handleClick = useCallback(() => {
    setShowModal(true);

    if (!setModalOpen) return;

    setModalOpen(true);
    onModalOpen && onModalOpen();
  }, [setModalOpen, onModalOpen]);

  const handleClose = useCallback(() => {
    setShowModal(false);

    if (!setModalOpen) return;
    setModalOpen(false);
    onModalClose && onModalClose();
  }, [setModalOpen, onModalClose]);

  const { clicked$ } = useContext(InteractableContext) || {};

  useSubscription(clicked$, handleClick);

  return (
    <>
      {interactionConfig.action === InteractionType.showModal && (
        <ShowModal
          elementType={elementType}
          elementFile={elementFile}
          modalConfig={interactionConfig.payload}
          show={showModal}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default ModelInteraction;
