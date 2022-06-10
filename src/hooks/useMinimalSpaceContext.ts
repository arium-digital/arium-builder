import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { SpaceContextType } from "types";
import { useSpaceSlugForId } from "./useSpaceIdForSlug";
import useTheme from "./useTheme";

const useMinimalSpaceContext = ({ spaceId }: { spaceId: string }) => {
  const [serverTimeOffset$] = useState(() => new BehaviorSubject(1));
  const router = useRouter();
  const [initialized$] = useState(new BehaviorSubject(true));

  const theme$ = useTheme({
    spaceId,
    documentationMode: false,
  });

  const spaceSlug = useSpaceSlugForId(spaceId);

  const spaceContext: SpaceContextType = useMemo(
    () => ({
      serverTimeOffset$,
      spaceSlugFromPath: spaceSlug || "",
      router,
      initialized$,
      spaceId,
      theme$,
      avatarMeshes: undefined,
      spaceSlug: spaceId,
      peersMetadata: undefined,
      audioContext: undefined,
    }),
    [serverTimeOffset$, spaceId, router, initialized$, theme$, spaceSlug]
  );

  return spaceContext;
};

export default useMinimalSpaceContext;
