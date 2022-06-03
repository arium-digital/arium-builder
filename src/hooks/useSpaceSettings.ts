import { useEffect, useState } from "react";
import { store } from "../db";
import { SpaceSettings } from "../types";

export const useSpaceSettings = ({
  authenticated,
  spaceId,
}: {
  authenticated: boolean;
  spaceId: string | undefined;
}) => {
  const [spaceSettings, setSpaceSettings] = useState<SpaceSettings>();
  // effect to update the spaceSettings from the database
  useEffect(() => {
    // listen to changes for the space settings
    if (authenticated && spaceId) {
      const subscription = store
        .collection("spaces")
        .doc(spaceId)
        .onSnapshot((settings) => {
          setSpaceSettings(settings.data() as SpaceSettings);
        });

      return () => {
        subscription();
      };
    }
  }, [spaceId, authenticated]);

  return spaceSettings;
};
