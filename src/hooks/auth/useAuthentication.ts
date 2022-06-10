import { useCallback, useEffect, useMemo, useState } from "react";
import { auth, signInAnonymously, User } from "db";
import { UserAuthClaims } from "../../../shared/sharedTypes";
import { Optional } from "types";

export type AuthState = {
  authenticated: boolean;
  isAnonymous: boolean;
  isNewUser: boolean;
  userId?: string;
  user?: Optional<User>;
  isAdmin: boolean;
  ensureSignedInAnonymously: boolean;
  claims: Optional<UserAuthClaims>;
  // claimsLoaded: boolean;
  pending: boolean;
};
export type HasAuthenticatedAuthState = { authState: AuthStateReturn };

export type AuthStateReturn = AuthState & {
  refreshClaims: () => Promise<void>;
};

export type AuthenticatedAuthState = AuthStateReturn & {
  authenticated: true;
  userId: string;
  user: User;
};

export const useAuthentication = ({
  ensureSignedInAnonymously,
  forceRefreshToken = false,
}: {
  ensureSignedInAnonymously: boolean;
  forceRefreshToken?: boolean;
}): AuthStateReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    isAnonymous: true,
    pending: true,
    isNewUser: false,
    // claimsLoaded: false,
    isAdmin: false,
    ensureSignedInAnonymously,
    claims: undefined,
  });

  const refreshUserClaims = useCallback(
    async (user: User, forceRefresh?: boolean) => {
      // force refresh of token
      await user.getIdToken(true);
      const claims = (await user.getIdTokenResult()).claims as UserAuthClaims;

      setAuthState((existing) => ({
        ...existing,
        isAdmin: !!claims.admin,
        claims,
      }));
    },
    []
  );

  const refreshClaims = useCallback(async () => {
    if (!authState.user) return;
    await refreshUserClaims(authState.user, true);
  }, [authState.user, refreshUserClaims]);

  useEffect(() => {
    auth().onAuthStateChanged(async function (user) {
      if (user) {
        const isNewUser =
          user.metadata.creationTime === user.metadata.lastSignInTime;
        setAuthState((existing) => ({
          ...existing,
          authenticated: true,
          userId: user.uid,
          user: user,
          isAnonymous: user.isAnonymous,
          isNewUser,
          panding: false,
        }));

        if (!user.isAnonymous) refreshUserClaims(user, forceRefreshToken);
        else {
          setAuthState((existing) => ({
            ...existing,
            claims: null,
            claimsLoaded: true,
          }));
        }
      } else {
        setAuthState((existing) => ({
          ...existing,
          authenticated: false,
          userId: undefined,
          isAnonymouse: false,
          pending: false,
        }));
        // sign in anonymously on firebase, and then user will be updated
        if (ensureSignedInAnonymously) await signInAnonymously();
      }

      setAuthState((existing) => ({
        ...existing,
        pending: false,
      }));
    });
  }, [ensureSignedInAnonymously, forceRefreshToken, refreshUserClaims]);

  return {
    ...authState,
    refreshClaims,
  };
};

// Configure FirebaseUI.
export const buildConfig = (): firebaseui.auth.Config => {
  const config: firebaseui.auth.Config = {
    // Popup signin flow rather than redirect flow.
    signInFlow: "popup",
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      {
        provider: auth.EmailAuthProvider.PROVIDER_ID,
        requireDisplayName: true,
      },
      auth.GoogleAuthProvider.PROVIDER_ID,
      auth.TwitterAuthProvider.PROVIDER_ID,
    ],
    tosUrl: "https://www.arium.xyz/terms",
    privacyPolicyUrl: "https://arium.xyz/privacy",
  };

  return config;
};

// Configure FirebaseUI.
export const buildSignUpConfig = (
  { prefix = "Sign up with" }: { prefix: string } = { prefix: "Sign up with" }
): firebaseui.auth.Config => {
  const config: firebaseui.auth.Config = {
    // Popup signin flow rather than redirect flow.
    signInFlow: "popup",
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      {
        provider: auth.GoogleAuthProvider.PROVIDER_ID,
        fullLabel: `${prefix} Google`,
      },
      {
        provider: auth.TwitterAuthProvider.PROVIDER_ID,
        fullLabel: `${prefix} Twitter`,
      },
      {
        provider: auth.EmailAuthProvider.PROVIDER_ID,
        requireDisplayName: true,
        fullLabel: `Sign up with Email`,
      },
    ],
    tosUrl: "https://www.arium.xyz/terms",
    privacyPolicyUrl: "https://arium.xyz/privacy",
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        const user = authResult.user as User;
        const isNewUser = authResult.additionalUserInfo.isNewUser;

        if (isNewUser) {
          if (user.providerId === auth.EmailAuthProvider.PROVIDER_ID)
            user.sendEmailVerification();
        }
        // Do something with the returned AuthResult.
        // Return type determines whether we continue the redirect
        // automatically or whether we leave that to developer to handle.
        return true;
      },
    },
  };

  return config;
};

export const useAuthenticationConfig = () => {
  const config = useMemo(() => buildConfig(), []);

  return config;
};
