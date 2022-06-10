import { useEffect } from "react";
import useUserIdChanged from "./useUserIdChanged";

const useReloadIfUserIdChanged = ({
  userId,
  attemptedToJoin,
}: {
  userId: string | undefined;
  attemptedToJoin: boolean;
}) => {
  const userIdChanged = useUserIdChanged(attemptedToJoin ? userId : undefined);

  useEffect(() => {
    if (userIdChanged) window.location.reload();
  }, [userIdChanged, attemptedToJoin]);
};

export default useReloadIfUserIdChanged;
