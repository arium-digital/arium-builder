import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Pixelation,
  Vignette,
  Sepia,
} from "@react-three/postprocessing";
import { HalfFloatType } from "three";
import { Effect, EffectKind } from "./types";

// const isBloom = (effect: Effect) => {
//   return effect.kind === "Bloom";
// };

// const isSSAO = (effect: Effect) => {
//   return effect.kind === "SSAO";
// };

// const isDepthOfField = (effect: Effect) => {
//   return effect.kind === "DepthOfField";
// };

const Effects = ({ effects }: { effects: [EffectKind, Effect][] }) => {
  return (
    <EffectComposer frameBufferType={HalfFloatType}>
      <>
        {/* <SMAA /> */}
        {effects.map(([kind, effect]) => {
          if (!effect.enabled) return <></>;
          // if (kind === 'SSAO') return <SSAO {...effect.props} key={i} />;

          if (kind === "Sepia") return <Sepia key={kind} {...effect} />;
          if (kind === "ChromaticAberration")
            return <ChromaticAberration key={kind} {...effect} />;
          if (kind === "Bloom") {
            return (
              <Bloom
                key={kind}
                luminanceThreshold={effect.luminanceThreshold}
                intensity={effect.intensity}
              />
            );
          }
          if (kind === "Noise") return <Noise key={kind} {...effect} />;
          if (kind === "Pixelation")
            return <Pixelation key={kind} {...effect} />;
          if (kind === "Vignette") return <Vignette key={kind} {...effect} />;

          return <></>;
        })}
      </>
    </EffectComposer>
  );
};

export default Effects;
