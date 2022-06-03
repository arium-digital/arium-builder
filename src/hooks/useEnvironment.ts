import { useEffect, useState } from "react";
import { defaultEnvironmentConfig } from "../defaultConfigs";
import { environmentDocument } from "../shared/documentPaths";
import { EnvironmentConfig } from "../spaceTypes";

const useEnvironment = ({ spaceId }: { spaceId: string | undefined }) => {
  const [environmentConfig, setEnvironmentConfig] = useState<
    EnvironmentConfig | undefined
  >();

  useEffect(() => {
    if (!spaceId) return;
    const unsubscribe = environmentDocument(spaceId).onSnapshot((doc) => {
      const data =
        (doc.data() as EnvironmentConfig) || defaultEnvironmentConfig();
      setEnvironmentConfig(data);
    });

    // cleanup
    return () => {
      unsubscribe();
      setEnvironmentConfig(undefined);
    };
  }, [spaceId]);

  return environmentConfig;
};

export default useEnvironment;
