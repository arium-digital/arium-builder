import { describe, expect } from "@jest/globals";
import computeVideoSize, { Size } from "../computeVideoSize";

describe("computeVideoSize", () => {
  describe("when the video aspect is bigger than the screen size", () => {
    test("it fits the video to the screen size", () => {
      const videoSize: Size = {
        width: 5000,
        height: 1000,
      };

      const screenSize: Size = {
        width: 16,
        height: 9,
      };

      const result = computeVideoSize({
        videoSize,
        screenSize,
      });

      expect(result.width).toEqual(screenSize.width);
      expect(result.height).toBeLessThan(screenSize.height);

      expect(result.width / result.height).toEqual(
        videoSize.width / videoSize.height
      );
    });
  });
  describe("when the video aspect is less than the screen size", () => {
    test("it fits the video to the screen size", () => {
      const videoSize: Size = {
        width: 10,
        height: 1000,
      };

      const screenSize: Size = {
        width: 16,
        height: 9,
      };

      const result = computeVideoSize({
        videoSize,
        screenSize,
      });

      expect(result.width).toBeLessThan(screenSize.width);
      expect(result.height).toEqual(screenSize.height);

      expect(result.width / result.height).toEqual(
        videoSize.width / videoSize.height
      );
    });
  });
});
