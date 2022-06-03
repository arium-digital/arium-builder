import {
  trackBetaSignupModalOpened,
  trackClickedToVisitFeaturedSpace,
  trackSignedUpForBeta,
  trackSubmittedEmail,
  trackVisitedHomePage,
} from "analytics/acquisition";
import { useEffect } from "react";

export const useBetaSignUpAnalytics = (
  open: boolean,
  submitted: boolean,
  formContent?: Record<string, string | boolean>
) => {
  useEffect(() => {
    if (open) {
      trackBetaSignupModalOpened();
    }
  }, [open]);

  useEffect(() => {
    if (submitted) {
      trackSignedUpForBeta();
    }
  }, [submitted, formContent]);
};

export const useLandingPageAnalytics = () => {
  useEffect(() => {
    trackVisitedHomePage();
  }, []);
};

export const useClickedVisitFeaturedEventAnalytics = (
  clicked: boolean,
  space: Record<string, string>
) => {
  useEffect(() => {
    if (clicked) {
      trackClickedToVisitFeaturedSpace(space);
    }
  }, [clicked, space]);
};

export const useEventRegistrationAnalytics = (
  submitted: boolean,
  email: string
) => {
  useEffect(() => {
    if (submitted && email) {
      trackSubmittedEmail({});
    }
  }, [email, submitted]);
};
