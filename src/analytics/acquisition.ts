import { trackIfEnabled } from "./init";

export const trackInviteOpened = ({ inviteId }: { inviteId: string }) => {
  trackIfEnabled("Invite Opened", { inviteId });
};

export const trackInviteClaimed = ({ inviteId }: { inviteId: string }) => {
  trackIfEnabled("Invite Claimed", { inviteId });
};

export const trackSignedUpForBeta = () => {
  trackIfEnabled("Signed Up for Beta");
};

export const trackVisitedHomePage = () => {
  trackIfEnabled("Visited home page");
};

export function trackClickedToVisitFeaturedSpace(
  space: Record<string, string>
) {
  trackIfEnabled("Clicked to visit featured space", space);
}

export const trackOpenedShareDialog = ({
  canInviteToEdit,
}: {
  canInviteToEdit: boolean;
}) => {
  trackIfEnabled("Opened share dialog", {
    "can invite to edit": canInviteToEdit,
  });
};

export const trackSentCollaboratorInvite = ({
  editor,
}: {
  editor: boolean;
}) => {
  trackIfEnabled("Invited collaborator", {
    "Can edit": editor,
  });
};

export const trackViewedInviteDialog = ({
  spaceSlug,
  spaceId,
}: {
  spaceSlug: string;
  spaceId: string;
}) => {
  trackIfEnabled("Viewed space collaborator invite dialog", {
    spaceId,
    spaceSlug,
  });
};

export const trackAcceptedSpaceInvite = ({
  spaceSlug,
  spaceId,
}: {
  spaceSlug: string;
  spaceId: string;
}) => {
  trackIfEnabled("Claimed space collaborator invite", { spaceId, spaceSlug });
};

const atCurrentLocation = "at current location";
export const trackShareLinkCopiedToClipboard = ({
  shareAtLocation,
}: {
  shareAtLocation: boolean;
}) => {
  trackIfEnabled("Copied share link to clipboard", {
    [atCurrentLocation]: shareAtLocation,
  });
};

export const trackChoseToShareAtLocation = () => {
  trackIfEnabled("Chose to share at location");
};

export const trackOpenedEvent = ({
  eventName,
  eventSlug,
  spaceSlug,
  spaceId,
}: {
  eventName: string;
  eventSlug: string;
  spaceSlug: string;
  spaceId: string;
}) => {
  trackIfEnabled("Opened Event", {
    eventSlug,
    eventName,
    spaceSlug,
    spaceId,
  });
};

export const trackSubmittedEmail = ({
  eventSlug,
  eventName,
  optInAriumUpdates,
  eventReminder,
}: {
  eventSlug?: string;
  eventName?: string;
  optInAriumUpdates?: boolean;
  eventReminder?: boolean;
}) => {
  trackIfEnabled("Submitted Email", {
    eventSlug,
    eventName,
    optInAriumUpdates,
    eventReminder,
  });
};

export const trackRegistered = () => {
  trackIfEnabled("Registered account");
};

export const trackClickedToJoinSpace = ({
  eventSlug,
  eventName,
  spaceSlug,
  spaceId,
}: {
  eventSlug: string;
  eventName: string;
  spaceSlug: string;
  spaceId: string;
}) => {
  trackIfEnabled("Clicked to join space", {
    eventSlug,
    eventName,
    spaceSlug,
    spaceId,
  });
};

export const OPENED_SPACE_CREATION_PAGE_EVENT = "Opened Space Creation Page";

export function trackBetaSignupModalOpened() {
  trackIfEnabled("Beta Signup Modal Opened");
}

export function trackInviteAlreadyUsed({
  byCurrentUser,
}: {
  byCurrentUser: boolean;
}) {
  trackIfEnabled("Invite already used", {
    "by current user": byCurrentUser,
  });
}

export function trackLandedOnSpaceSelectionPage() {
  trackIfEnabled("Landed on space selection page.");
}

export function trackSelectedSpace({
  selectedSpaceTemplate,
}: {
  selectedSpaceTemplate?: string;
}) {
  trackIfEnabled("Selected Space", { spaceId: selectedSpaceTemplate });
}

export function trackPreviewedSpace({
  spaceSlug,
  spaceId,
}: {
  spaceSlug: string;
  spaceId: string;
}) {
  trackIfEnabled("Previewed Space", { spaceId, spaceSlug });
}

export function trackSpaceCreated({
  selectedSpaceTemplate,
  spaceName,
}: {
  selectedSpaceTemplate: string;
  spaceName?: string;
}) {
  trackIfEnabled("Space Created", {
    spaceId: selectedSpaceTemplate,
    newSpaceId: spaceName,
  });
}
