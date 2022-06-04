import React from "react";

import Onboarding from "./Onboarding";

import styles from "css/ui.module.scss";
import { EntranceFlowProps } from "Space/componentTypes";
import LegalLinks from "Space/LegalLinks";

const EntranceFlow = ({
  initialize,
  initialized,
  spaceId,
  enterSpace,
  profileSetter,
  setKeyboardControlsDisabled,
  spaceMetadata,
  eventSlug,
  spaceSlug,
  inviteId,
  isAnonymous,
  userId,
}: EntranceFlowProps) => {
  return (
    <>
      <div className={styles.userInterface}>
        <div className={styles.onboarding}>
          <Onboarding
            spaceId={spaceId}
            inviteId={inviteId}
            enterSpace={enterSpace}
            setKeyboardControlsDisabled={setKeyboardControlsDisabled}
            profileSetter={profileSetter}
            initialize={initialize}
            initialized={initialized}
            spaceMetadata={spaceMetadata}
            eventSlug={eventSlug}
            spaceSlug={spaceSlug}
            isAnonymous={isAnonymous}
            userId={userId}
          />
        </div>
      </div>
      <div className={styles.legalLinksContainer}>
        <LegalLinks />
      </div>
    </>
  );
};

export default EntranceFlow;
