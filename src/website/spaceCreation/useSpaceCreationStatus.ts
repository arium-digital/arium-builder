import { store } from "db";
import { SpaceAccess } from "hooks/auth/useSpaceAccess";
import { useEffect, useState } from "react";
import { Optional } from "types";
import { UserAccount } from "../../../shared/sharedTypes";

export const useUserAccount = (userId: Optional<string>) => {
  const [account, setAccount] = useState<UserAccount | null>();

  useEffect(() => {
    if (userId) {
      const unsub = store
        .collection("userAccounts")
        .doc(userId)
        .onSnapshot((snapshot) => {
          if (!snapshot.exists) {
            setAccount(null);
            return;
          }

          setAccount(snapshot.data() as UserAccount);
        });

      return () => {
        unsub();
      };
    }
  }, [userId]);

  return account;
};

export interface SpaceCreationStatus {
  canCreate: boolean;
  text: string | null;
  availableToCreate: number;
}

function toSpaceCreationStatus({
  numberOfCreatedSpace,
  maxSpaces,
  isAdmin,
}: {
  numberOfCreatedSpace: number | null;
  maxSpaces: number;
  isAdmin: boolean;
}): SpaceCreationStatus {
  if (numberOfCreatedSpace === null)
    return {
      canCreate: false,
      text: null,
      availableToCreate: 0,
    };

  if (maxSpaces === 0) {
    return {
      canCreate: false,
      text: "You cannot create any spaces.",
      availableToCreate: 0,
    };
  }

  if (isAdmin)
    return {
      canCreate: true,
      text: `You are an admin, and can create an unlimited number of spaces.`,
      availableToCreate: maxSpaces,
    };

  if (numberOfCreatedSpace === 0) {
    return {
      canCreate: true,
      text: `You can create up to ${maxSpaces} spaces`,
      availableToCreate: maxSpaces,
    };
  }

  if (numberOfCreatedSpace < maxSpaces)
    return {
      canCreate: true,
      text: `You can create up to ${
        maxSpaces - numberOfCreatedSpace
      } more spaces`,
      availableToCreate: maxSpaces - numberOfCreatedSpace,
    };

  return {
    canCreate: false,
    text: `You have created the maxinum number of spaces available to your account.`,
    availableToCreate: 0,
  };
}

const getMaxSpaces = (
  spaceAccess: SpaceAccess,
  userAccount: Optional<UserAccount>,
  numberOfCreatedSpace: Optional<number>
) => {
  if (spaceAccess.isAdmin) return (numberOfCreatedSpace || 0) + 1;

  return userAccount?.maxSpaces || 0;
};

const useSpaceCreationStatus = ({
  userId,
  spaceAccess,
}: {
  userId: string | undefined;
  spaceAccess: SpaceAccess;
}) => {
  const userAccount = useUserAccount(userId);

  const numberOfCreatedSpace = spaceAccess.pending
    ? null
    : spaceAccess.ownedSpaces.length;

  const maxSpaces = getMaxSpaces(
    spaceAccess,
    userAccount,
    numberOfCreatedSpace
  );

  const createdSpacesStatus = toSpaceCreationStatus({
    numberOfCreatedSpace,
    maxSpaces,
    isAdmin: spaceAccess.isAdmin,
  });

  return createdSpacesStatus;
};

export default useSpaceCreationStatus;
