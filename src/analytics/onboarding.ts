import { trackIfEnabled, trackLinksIfEnabled } from "./init";

const failedEvent = "Failed requesting media";
const succeededEvent = "Succeeded requesting media";
export const spaceLoadedEvent = "Space loaded";

export const trackFailedRequestingMedia = ({ kind }: { kind: string }) => {
  trackIfEnabled(failedEvent, { kind });
};

export const trackSucceededRequestingMedia = ({ kind }: { kind: string }) => {
  trackIfEnabled(succeededEvent, { kind });
};

export function trackOpenedSpace({
  spaceSlug,
  spaceId,
}: {
  spaceSlug: string;
  spaceId: string;
}) {
  trackIfEnabled("Opened Space", { spaceSlug, spaceId });
}

export function trackClickedToInitialized({
  spaceId,
  spaceSlug,
  grantAccess,
}: {
  spaceId: string;
  spaceSlug: string;
  grantAccess: boolean;
}) {
  trackIfEnabled("Clicked to Initialize", {
    spaceSlug,
    spaceId,
    "agreed to grant accesss": grantAccess,
  });
}

export function trackClickedToEnterSpace({
  spaceSlug,
  spaceId,
}: {
  spaceSlug: string;
  spaceId: string;
}) {
  trackIfEnabled("Clicked to Enter Space", { spaceSlug, spaceId });
}

export const trackClicksInModalLinks = () => {
  trackLinksIfEnabled(".modal-container", "Modal link clicked");
};
