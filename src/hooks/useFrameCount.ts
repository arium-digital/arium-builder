import { useEffect, useRef } from "react";

export const useFrameCount = (): number => {
  const frameCountRef = useRef<number>(0);
  const requestRef = useRef<any>();

  useEffect(() => {
    const update = () => {
      frameCountRef.current += 1;
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return frameCountRef.current;
};
