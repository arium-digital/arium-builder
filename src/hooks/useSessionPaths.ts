import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { SessionPaths } from "../shared/dbPaths";

const useSessionPaths = ({
  userId,
  sessionId,
  authenticated,
}: {
  userId: string | undefined;
  sessionId: string | undefined;
  authenticated: boolean;
}) => {
  const [sessionPathsSubject] = useState(
    new BehaviorSubject<SessionPaths | undefined>(undefined)
  );

  useEffect(() => {
    if (!authenticated || !sessionId || !userId) {
      // only set it if changed
      if (sessionPathsSubject.value !== undefined) {
        sessionPathsSubject.next(undefined);
      }
    } else {
      const paths = new SessionPaths({ sessionId, userId });
      sessionPathsSubject.next(paths);
    }
  }, [userId, sessionId, authenticated, sessionPathsSubject]);

  return sessionPathsSubject;
};

export default useSessionPaths;
