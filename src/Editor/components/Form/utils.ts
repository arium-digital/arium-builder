import { useMemo } from "react";

export const usePowersOfTwo = ({ min, max }: { min: number; max: number }) => {
  const powersOfTwo = useMemo(() => {
    const values: number[] = [];

    const lastValue = min;
    let currentIndex = 1;
    while (lastValue <= max) {
      const currentVal = Math.pow(2, currentIndex);
      if (currentVal > min && currentVal <= max) {
        values.push(currentVal);
      }

      if (currentVal >= max) {
        break;
      }

      currentIndex++;
    }

    return values.map((value) => ({
      value,
      label: value.toString(),
    }));
  }, [min, max]);

  return powersOfTwo;
};
