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
}: {
  numberOfCreatedSpace: number | null;
  maxSpaces: number;
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
      text:
        "You cannot create any spaces.  Please contact info@arium.xyz or join our discord to request more spaces.",
      availableToCreate: 0,
    };
  }

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
    text: `You have created the maxinum number of spaces available to your account. Please contact info@arium.xyz or join our discord to request more spaces.`,
    availableToCreate: 0,
  };
}

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

  const createdSpacesStatus = toSpaceCreationStatus({
    numberOfCreatedSpace,
    maxSpaces: userAccount?.maxSpaces || 0,
  });

  return createdSpacesStatus;
};

export default useSpaceCreationStatus;
