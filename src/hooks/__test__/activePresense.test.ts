import { describe, expect } from "@jest/globals";
import { isStillActive } from "hooks/useActivePresence";
describe("isStillActive", () => {
  const currentTime = 10;

  test("is false when the last update time is outside the active time difference minimum", () => {
    const lastChanged = currentTime - 5;
    const maxDifference = 4;
    const result = isStillActive({
      currentTime,
      lastChanged,
      maxDifference,
    });

    expect(result).toBeFalsy();
  });

  test("is true when the last update time is within the active time difference minimum", () => {
    const lastChanged = currentTime - 3;
    const maxDifference = 4;
    const result = isStillActive({
      currentTime,
      lastChanged,
      maxDifference,
    });

    expect(result).toBeTruthy();
  });
});
