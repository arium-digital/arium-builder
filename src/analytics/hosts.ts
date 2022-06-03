import { throttle } from "lodash";
import { ElementType } from "spaceTypes";
import { trackIfEnabled } from "./init";

const trackUpdatedContent = () => {
  trackIfEnabled("Edited space");
};

export const throttledTrackEditContent = throttle(trackUpdatedContent, 10000);
export const trackCreatedElement = ({
  elementType,
  userInterface,
}: {
  elementType: ElementType;
  userInterface: "in space" | "advanced";
}) => {
  trackIfEnabled("Created element", {
    elementType,
    userInterface,
  });
  throttledTrackEditContent();
};
