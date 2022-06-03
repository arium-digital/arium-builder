import {
  trackClickedToJoinSpace,
  trackOpenedEvent,
  trackSubmittedEmail,
} from "analytics/acquisition";
import { useEffect } from "react";
import { EventInfo } from "../../shared/sharedTypes";
export type EventRegistrationState = {
  optInAriumUpdates: boolean;
  email: string;
  eventReminder: boolean;
};

export const useEventAnalytics = ({
  event: { slug: eventSlug, spaceId, name: eventName },
  eventRegistrationState,
  joinedSpace,
}: {
  event: EventInfo;
  joinedSpace: boolean | undefined;
  eventRegistrationState: EventRegistrationState | undefined;
}) => {
  useEffect(() => {
    if (eventSlug) {
      trackOpenedEvent({ eventName, eventSlug, spaceId, spaceSlug: spaceId });
    }
  }, [eventName, eventSlug, spaceId]);

  useEffect(() => {
    if (eventRegistrationState) {
      const { optInAriumUpdates, eventReminder } = eventRegistrationState;

      trackSubmittedEmail({
        eventSlug,
        eventName,
        optInAriumUpdates,
        eventReminder,
      });
    }
  }, [eventName, eventRegistrationState, eventSlug]);

  useEffect(() => {
    if (joinedSpace) {
      trackClickedToJoinSpace({
        eventSlug,
        eventName,
        spaceId,
        spaceSlug: spaceId,
      });
    }
  }, [eventName, eventSlug, joinedSpace, spaceId]);
};
