import { memo, useState, useEffect } from "react";
import { spaceEffectsDoc } from "shared/documentPaths";
import { Effect, EffectKind, SpaceEffects } from "./types";
import dynamic from "next/dynamic";

const Effects = dynamic(() => import("./Effects"));

const PostProcessing = memo(({ spaceId }: { spaceId: string }) => {
  const [effects, setEffects] = useState<[EffectKind, Effect][]>();

  useEffect(() => {
    const unsub = spaceEffectsDoc(spaceId).onSnapshot((snap) => {
      if (!snap.exists) {
        setEffects(undefined);
        return;
      }
      // get effects
      // trigger a build
      const spaceEffects = snap.data() as SpaceEffects;
      const postProcessing = spaceEffects.postProcessing;
      const enabledEffects =
        postProcessing &&
        (Object.entries(postProcessing).filter(([_, x]) => x.enabled) as [
          EffectKind,
          Effect
        ][]);

      setEffects(enabledEffects);
    });

    return () => unsub();
  }, [spaceId]);

  if (!effects || effects.length === 0) return null;

  return <Effects effects={effects} />;
});

export default PostProcessing;
