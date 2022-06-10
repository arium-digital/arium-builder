import { LegacyPlacardConfig } from "./legacyPlacard";

const defaultPlacardTextSize = 16;

export const legacyPlacardConfig = (): LegacyPlacardConfig => ({
  text: "",
  font: "Roboto",
  frontColor: "#000000",
  size: defaultPlacardTextSize,
  hasBacking: true,
  backingOffsetScale: 0.1,
  anchorX: "center",
  anchorY: "middle",
  textAlign: "left",
});
