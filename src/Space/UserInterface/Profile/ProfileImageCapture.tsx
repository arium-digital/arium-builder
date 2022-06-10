import { SelfViewRow } from "../EntranceFlow/SelfViewCircle";
import React, { useCallback, useMemo } from "react";
// import controlsStyles from "css/controls.module.scss";
import cta from "css/cta.module.scss";
import clsx from "clsx";
import { Row, Col } from "react-bootstrap";
import UploadPhotoDialog from "./UploadPhotoDialog";
import SelfView from "../../Peers/SelfView";
import { PossiblyNullStringDict } from "types";
import { useBooleanQueryParam, useQuery } from "libs/pathUtils";
import { usePhotoCapture } from "./hooks";
import { Observable } from "rxjs";
import { useCurrentValueFromObservable } from "hooks/useObservable";
// import { useEventCallback } from "@material-ui/core";

export const ProfileImageActionButton = ({
  onClick,
  text,
  primary,
}: {
  onClick: () => void;
  text: string;
  primary: boolean;
}) => {
  const handleClicked = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onClick();
    },
    [onClick]
  );

  return (
    <div
      className={clsx(
        cta.container,
        !primary ? cta.secondaryContainer : null
        // cta.bottomFixedOnSmall
      )}
    >
      <button
        onClick={handleClicked}
        className={primary ? cta.primary : cta.secondary}
        id={text}
        title={text}
        data-testid={"captureProfile"}
      >
        {text}
      </button>
    </div>
  );
};

const ProfileImageWithCancel = ({
  handleChange,
}: {
  handleChange: () => void;
}) => {
  return (
    <>
      <Row className={"mt-5 mt-md-1 py-2 "}>
        <Col
          xs={12}
          className="align-self-end py-2 px-4 justify-content-center"
        >
          <ProfileImageActionButton
            onClick={handleChange}
            text={"change avatar image"}
            primary={false}
          />
        </Col>
        <Col
          xs={12}
          className="align-self-end px-4 py-1 justify-content-center"
        >
          <i>
            This image will appear on your avatar when your camera is off or
            when you are far away from other users.
          </i>
        </Col>
      </Row>
    </>
  );
};

const empty = {};
const ProfileImageCapture = ({
  hasVideoStream,
  handleProfilePhotoUrlUpdated,
  peerMetadata$,
  userId,
}: {
  hasVideoStream?: boolean;
  handleProfilePhotoUrlUpdated: (profileImageUrl: string | null) => void;
  peerMetadata$: Observable<PossiblyNullStringDict>;
  userId: string;
}) => {
  const {
    captureState,
    handleChangeProfileImage,
    handlePhotoUploaded,
    handleCloseUploadPhotoDialog,
  } = usePhotoCapture({ handleProfilePhotoUrlUpdated, userId });

  const peerMetadata = useCurrentValueFromObservable(peerMetadata$, empty);

  const queryParams = useQuery();

  const profilePhoto = useBooleanQueryParam("profile-photo", queryParams);

  const shouldCaptureProfilePhoto = useMemo(() => {
    return profilePhoto || !hasVideoStream;
  }, [hasVideoStream, profilePhoto]);

  return (
    <>
      <SelfViewRow showLogo={false}>
        <SelfView
          peerMetadata={peerMetadata}
          preferVideoOrPhotoTexture={
            shouldCaptureProfilePhoto ? "photo" : "video"
          }
        />
      </SelfViewRow>
      {shouldCaptureProfilePhoto && (
        <ProfileImageWithCancel handleChange={handleChangeProfileImage} />
      )}
      {captureState.capture && (
        <UploadPhotoDialog
          show={true}
          handleClose={handleCloseUploadPhotoDialog}
          handleImageSelected={handlePhotoUploaded}
        />
      )}
    </>
  );
};

export default ProfileImageCapture;
