import { FileLocation } from "./shared";
import { PlaySettings, PositionalAudioConfig } from "./video";

export type AudioPlaySettings = PlaySettings;

export type AudioConfig = {
  audioFile?: FileLocation;
  playSettings?: AudioPlaySettings;
  positionalAudio?: PositionalAudioConfig;
};
