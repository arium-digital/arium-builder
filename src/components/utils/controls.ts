import React from "react";

export const preventHighlight = (e: React.SyntheticEvent) => {
  e.preventDefault();
  // @ts-ignore
  if (document.activeElement && document.activeElement.blur)
    // @ts-ignore
    document.activeElement.blur();
};
