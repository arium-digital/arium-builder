export type VideoAspect = "16:9" | "4:3" | "16:19" | "16:10";

export type ScreenShareConfig = {
  aspect?: VideoAspect;
  legacyRotation?: boolean;
  guestsCanScreenShare?: boolean;
};
