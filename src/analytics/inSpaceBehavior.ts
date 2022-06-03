import { ElementType } from "spaceTypes";
import { trackIfEnabled } from "./init";

export const trackOpenedModal = (elementType: ElementType | undefined) => {
  trackIfEnabled("Opened modal", {
    elementType,
  });
};

export function trackEnteredPortal({
  fromSpace,
  toSpace,
}: {
  fromSpace: string | undefined;
  toSpace: string;
}) {
  trackIfEnabled("Entered portal", { fromSpace, toSpace });
}
