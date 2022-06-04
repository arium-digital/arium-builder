import { getMediaElementSize } from "../utils";
import { describe, expect } from "@jest/globals";

describe("getMediaElementSize", () => {
  test("returns a video that fits into the container when it is wider", () => {
    const containerHeight = 1293;
    const containerWidth = 2058;
    const videoHeight = 1293;
    const videoWidth = 1904;

    const result = getMediaElementSize({
      containerHeight,
      containerWidth,
      mediaSize: {
        width: videoWidth,
        height: videoHeight,
      },
    });

    expect(result.width).toBeLessThanOrEqual(containerWidth);
    expect(result.height).toBeLessThanOrEqual(containerHeight);

    const aspect = videoWidth / videoHeight;

    expect(Math.round(aspect)).toBe(
      Math.round((result.width as number) / (result.height as number))
    );
  });
});
