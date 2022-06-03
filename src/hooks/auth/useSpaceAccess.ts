import { store } from "db";
import { useEffect, useMemo, useState, createContext } from "react";
import { UserRoles } from "../../../shared/sharedTypes";
import { AuthStateReturn } from "./useAuthentication";

export interface SpaceAccess {
  canEdit: boolean;
  canInvite: boolean;
  owner: boolean;
  editor: boolean;
  editableSpaces: string[];
  ownedSpaces: string[];
  pending: boolean;
  isAdmin: boolean;
}

export const SpaceAccessContext = createContext<SpaceAccess | null>(null);

const toEditableSpaces = (userRoles: UserRoles) => {
  const allResults = new Set<string>();

  userRoles.editor?.forEach((editor) => allResults.add(editor));
  userRoles.owner?.forEach((owner) => allResults.add(owner));

  return Array.from(allResults).sort();
};

const toSpaceAccess = (
  roles: UserRoles | undefined,
  pending: boolean,
  spaceId: string | undefined,
  isAdmin: boolean | undefined
): SpaceAccess => {
  if (!roles || pending) {
    return {
      canEdit: false,
      canInvite: false,
      owner: false,
      editor: false,
      editableSpaces: [],
      ownedSpaces: [],
      pending: pending,
      isAdmin: !!isAdmin,
    };
  }

  const owner = spaceId && roles.owner && roles.owner.includes(spaceId);
  const editor = spaceId && roles.editor && roles.editor.includes(spaceId);

  return {
    canEdit: !!(owner || editor) || !!isAdmin,
    canInvite: !!owner,
    owner: !!owner,
    editor: !!editor,
    editableSpaces: toEditableSpaces(roles),
    ownedSpaces: roles.owner || [],
    pending: false,
    isAdmin: !!isAdmin,
  };
};

export const useSpaceAccess = ({
  userId,
  spaceId,
  claims,
  refreshClaims,
  authenticated,
  isAnonymous,
}: {
  spaceId: string | undefined;
} & Pick<
  AuthStateReturn,
  "userId" | "claims" | "refreshClaims" | "authenticated" | "isAnonymous"
>): SpaceAccess => {
  const [rolesAndPending, setRolesAndPending] = useState<{
    roles?: UserRoles;
    pending: boolean;
  }>({
    pending: true,
  });

  useEffect(() => {
    if (!authenticated) return;
    const sub = store
      .collection("userRoles")
      .doc(userId)
      .onSnapshot((snapshot) => {
        if (!snapshot.exists)
          setRolesAndPending({
            roles: undefined,
            pending: false,
          });
        else
          setRolesAndPending({
            roles: snapshot.data() as UserRoles,
            pending: false,
          });
      });

    return () => sub();
  }, [userId, authenticated]);

  const hasClaims = !!claims;
  const claimsVersion = claims?.v;
  useEffect(() => {
    if (isAnonymous || !hasClaims || !rolesAndPending.roles?.version) return;
    if (claimsVersion !== rolesAndPending.roles.version) {
      refreshClaims();
    }
  }, [
    rolesAndPending.roles?.version,
    refreshClaims,
    hasClaims,
    claimsVersion,
    isAnonymous,
  ]);

  const spaceAccess: SpaceAccess = useMemo(
    () =>
      toSpaceAccess(
        rolesAndPending.roles,
        rolesAndPending.pending,
        spaceId,
        claims?.admin
      ),
    [rolesAndPending, spaceId, claims?.admin]
  );

  return spaceAccess;
};
