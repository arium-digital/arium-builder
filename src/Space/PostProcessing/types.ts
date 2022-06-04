export type EffectKind =  //"SSAO"
  | "Bloom"
  | "DepthOfField"
  | "Noise"
  | "Pixelation"
  | "ChromaticAberration"
  | "Vignette"
  | "Sepia";

export type Effect = { [key: string]: any } & { enabled?: boolean };

export type Effects = {
  [kind in EffectKind]?: Effect;
};

export interface SpaceEffects {
  postProcessing?: Effects;
}
