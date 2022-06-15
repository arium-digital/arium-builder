import {
  AuthStateReturn,
  useAuthentication,
} from "../hooks/auth/useAuthentication";
import { EnsureAuth } from "./Layout";
import Alert from "@material-ui/lab/Alert";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSpaceAccess } from "hooks/auth/useSpaceAccess";
import { spaceSlugForId } from "hooks/useSpaceIdForSlug";

const RedirectToDefaultSpace = ({
  authState,
}: {
  authState: AuthStateReturn;
}) => {
  const router = useRouter();

  const { editableSpaces: spaceEditors } = useSpaceAccess({
    ...authState,
    spaceId: undefined,
  });

  const firstSpace = spaceEditors[0];

  useEffect(() => {
    if (!firstSpace) return;
    (async () => {
      const firstSpaceSlug = await spaceSlugForId(firstSpace);
      router.push(`/editor/${firstSpaceSlug}/elements`);
    })();
  }, [firstSpace, router]);

  if (!firstSpace)
    return (
      <Alert severity="error">
        We're sorry, but it appears you do not have access to any spaces to
        edit.
      </Alert>
    );

  return null;
};

const LayoutWrapper = () => {
  const authState = useAuthentication({
    ensureSignedInAnonymously: false,
    forceRefreshToken: true,
  });
  return (
    <EnsureAuth authState={authState}>
      <RedirectToDefaultSpace authState={authState} />
    </EnsureAuth>
  );
};

export default LayoutWrapper;
