import { useRef, useEffect } from "react";

export function useWhyDidYouUpdate(
  name: string,
  props: { [key: string]: any }
) {
  // Get a mutable ref object where we can store props ...
  // ... for comparison next time this hook runs.
  const previousProps = useRef<{ [key: string]: any }>();

  useEffect(() => {
    const existingProps = previousProps.current;
    if (existingProps) {
      // Get all keys from previous and current props
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      // Use this object to keep track of changed props
      const changesObj: { [key: string]: any } = {};
      // Iterate through keys
      allKeys.forEach((key) => {
        // If previous is different from current
        if (existingProps[key] !== props[key]) {
          // Add to changesObj
          changesObj[key] = {
            from: existingProps[key],
            to: props[key],
          };
        }
      });

      // If changesObj not empty then output to console
      if (Object.keys(changesObj).length) {
        console.log("[why-did-you-update]", name, changesObj);
      }
    }

    // Finally update previousProps with current props for next hook call
    previousProps.current = props;
  });
}
