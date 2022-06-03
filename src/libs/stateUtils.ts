/**
 * Returns a random number between min (inclusive) and max (exclusive)
 * https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range#1527820
 */
export function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export const randomPosition = (range: number[]) => {
  return randomRange(range[0], range[1]);
};
