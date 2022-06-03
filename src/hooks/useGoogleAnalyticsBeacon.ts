import { useEffect } from "react";
import * as gtag from "../libs/gtag";

export const useGoogleAnalyticsBeacon = (spaceId: string | undefined) => {
  useEffect(() => {
    const analyticsIntervalHandle = setInterval(() => {
      if (window.gtag !== undefined) {
        gtag.event({
          action: "active",
          category: "Space Events",
          label: spaceId ? spaceId : "",
          value: 1,
        });
      }
    }, 30000);

    return () => {
      clearInterval(analyticsIntervalHandle);
    };
  }, [spaceId]);

  return null;
};
