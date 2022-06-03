import { inRange } from "../utils";
import { describe, expect, it } from "@jest/globals";
import { Vector3 as _Vector3 } from "three";

describe("inRange", () => {
  const Transform = (x: number) => ({
    position: {
      x: x,
      y: x,
      z: x,
    },
  });

  const Vector3 = (x: number) => new _Vector3(x, x, x);

  it.each`
    a                | b              | dist   | result
    ${Vector3(3)}    | ${Vector3(6)}  | ${28}  | ${true}
    ${Vector3(2.8)}  | ${Vector3(6)}  | ${30}  | ${false}
    ${Vector3(-2.5)} | ${Vector3(6)}  | ${217} | ${true}
    ${Vector3(-2.5)} | ${Vector3(-6)} | ${36}  | ${false}
  `("should be accurate", ({ a, b, dist, result }) => {
    expect(inRange(a, b, dist)).toBe(result);
  });

  it.each`
    a                  | b                | dist   | result
    ${Transform(3)}    | ${Transform(6)}  | ${28}  | ${true}
    ${Transform(2.8)}  | ${Transform(6)}  | ${30}  | ${false}
    ${Transform(-2.5)} | ${Transform(6)}  | ${217} | ${true}
    ${Transform(-2.5)} | ${Transform(-6)} | ${36}  | ${false}
  `("should handel Transform type", ({ a, b, dist, result }) => {
    expect(inRange(a, b, dist)).toBe(result);
  });

  it.each`
    a                 | b                | dist   | result
    ${Transform(3)}   | ${Vector3(6)}    | ${28}  | ${true}
    ${Transform(2.8)} | ${Vector3(6)}    | ${30}  | ${false}
    ${Vector3(-2.5)}  | ${Transform(6)}  | ${217} | ${true}
    ${Vector3(-2.5)}  | ${Transform(-6)} | ${36}  | ${false}
  `("should handel mixed types", ({ a, b, dist, result }) => {
    expect(inRange(a, b, dist)).toBe(result);
  });
});
