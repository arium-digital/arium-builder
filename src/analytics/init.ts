import { AuthState } from "hooks/auth/useAuthentication";
import * as mixpanel from "mixpanel-browser";
import { useEffect } from "react";
import { trackRegistered } from "./acquisition";

const mixpanelEnabledFromConfig =
  process.env.NEXT_PUBLIC_ENABLE_MIXPANEL === "true" ||
  process.env.NODE_ENV === "production";

let cookieRejected = false;

let mixpanelEnabled = mixpanelEnabledFromConfig && !cookieRejected;

if (typeof window !== "undefined") {
  window.addEventListener("CookieScriptReject", function () {
    //your code here
    cookieRejected = true;
  });
}

export function useInitAnalyticsAndIdentify({
  userId,
  isAnonymous,
  isNewUser,
}: Pick<AuthState, "userId" | "isAnonymous" | "isNewUser">) {
  useEffect(() => {
    if (mixpanelEnabled) mixpanel.init("f133b13de19ae43071245d6ad1f15480");
  }, []);

  useEffect(() => {
    if (isAnonymous || !mixpanelEnabled || isNewUser) return;
    if (userId) {
      mixpanel.identify(userId);
    }
  }, [userId, isAnonymous, isNewUser]);
}

export function registerNewUserIfMixpanelEnabled(userId: string) {
  if (mixpanelEnabled) {
    mixpanel.identify(userId);
    mixpanel.alias(userId);
    trackRegistered();
  }
}

interface AnyDict {
  [key: string]: any;
}

export const trackIfEnabled = (eventName: string, properties?: AnyDict) => {
  // console.debug("fired: " + eventName, properties);
  if (mixpanelEnabled) {
    try {
      mixpanel.track(eventName, properties);
    } catch (e) {
      console.error(e);
    }
  }
};

export const useTrackOnce = (eventName: string, properties?: AnyDict) => {
  useEffect(() => {
    trackIfEnabled(eventName, properties);
  }, [eventName, properties]);
};

export const setSuperPropertiesIfEnabled = (values: AnyDict) => {
  if (mixpanelEnabled) {
    try {
      mixpanel.register(values);
    } catch (e) {
      console.error(e);
    }
  }
};

export const setPeopleIfEnabled = (values: AnyDict) => {
  if (mixpanelEnabled) {
    mixpanel.people.set(values);
  }
};

export const trackLinksIfEnabled = (selector: string, message: string) => {
  if (mixpanelEnabled) {
    try {
      mixpanel.track_links(selector, message);
    } catch (e) {
      console.error(e);
    }
  }
};
