import { setSuperPropertiesIfEnabled } from "analytics/init";
import { useEffect, useMemo } from "react";
import { User } from "db";
import { Optional, StringDict } from "types";
import { METADATA_KEYS } from "./usePeersMetadata";
import {
  trackClickedToEnterSpace,
  trackClicksInModalLinks,
  trackOpenedSpace,
} from "analytics/onboarding";

const useSpaceAnalytics = ({
  spaceId,
  spaceSlug,
  eventSlug,
  enteredSpace,
  userInfo: { owner, editor },
  metadata,
}: {
  spaceId: string | undefined;
  spaceSlug: string | undefined;
  eventSlug: Optional<string>;
  userInfo: {
    user: User | undefined;
    authenticated?: boolean;
    owner: boolean;
    editor: boolean;
  };
  enteredSpace: boolean;
  metadata: StringDict | undefined;
}) => {
  useEffect(() => {
    if (spaceSlug && spaceId) {
      trackOpenedSpace({ spaceSlug, spaceId });
    }
  }, [spaceSlug, spaceId]);

  useEffect(() => {
    if (spaceSlug && enteredSpace && spaceId) {
      trackClickedToEnterSpace({ spaceSlug, spaceId });
    }
  }, [enteredSpace, spaceSlug, spaceId]);

  useEffect(() => {
    if (spaceSlug) {
      trackClicksInModalLinks();
    }
  }, [spaceSlug]);

  useEffect(() => {
    const ownerOrEditor = !!(owner || editor);
    const guest = !ownerOrEditor;
    setSuperPropertiesIfEnabled({
      ownerOrEditor,
      guest,
      spaceSlug,
      spaceId,
      event: eventSlug,
    });
  }, [owner, editor, spaceSlug, spaceId, eventSlug]);

  const name = useMemo(() => (metadata ? metadata[METADATA_KEYS.name] : null), [
    metadata,
  ]);

  useEffect(() => {
    setSuperPropertiesIfEnabled({
      nameIsSet: !!name,
    });
  }, [name]);
};

export default useSpaceAnalytics;
