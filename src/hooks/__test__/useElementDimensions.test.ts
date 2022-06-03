/* eslint-disable import/first */
import { describe, expect } from "@jest/globals";
import { DEFAULT_IMAGE_WIDTH } from "defaultConfigs";
import { calculateElementShape } from "hooks/useElementDimensions";
import { HasWidthHeight } from "spaceTypes/image";

describe.only("Calculate Media Elements Dimensions", () => {
  const wh = (width: number, height: number): HasWidthHeight => ({
    width,
    height,
  });
  it.each`
    mediaShape       | targetWidth  | defaultWidth | expectedResult
    ${undefined}     | ${undefined} | ${32}        | ${null}
    ${wh(12, 99)}    | ${4}         | ${undefined} | ${[4, 33]}
    ${wh(2, 8)}      | ${4}         | ${undefined} | ${[4, 16]}
    ${wh(1280, 720)} | ${3.2}       | ${undefined} | ${[3.2, 1.8]}
    ${wh(1280, 720)} | ${3.2}       | ${36}        | ${[3.2, 1.8]}
    ${wh(1280, 720)} | ${undefined} | ${3.2}       | ${[3.2, 1.8]}
    ${wh(1280, 720)} | ${undefined} | ${32}        | ${[32, 18]}
    ${wh(1280, 720)} | ${undefined} | ${undefined} | ${[DEFAULT_IMAGE_WIDTH, DEFAULT_IMAGE_WIDTH / (1280 / 720)]}
  `(
    "should be accurate",
    ({ mediaShape, targetWidth, defaultWidth, expectedResult }) => {
      const aspect = mediaShape
        ? mediaShape.width / mediaShape.height
        : undefined;
      const result = calculateElementShape(aspect, targetWidth, defaultWidth);

      if (expectedResult == null) expect(result).toBe(null);
      else {
        const resultTuple = [result?.width, result?.height];
        resultTuple.forEach((val, i) =>
          expect(val).toBeCloseTo(expectedResult[i])
        );
      }
    }
  );
});
