import { Stats } from "@react-three/drei";
import { useShortcutToggledBoolean } from "hooks/useMousetrap";
import React, { FC } from "react";

const StatsWithShortcut: FC<Record<string, never>> = () => {
  const [show] = useShortcutToggledBoolean("ctrl+i");
  if (!show) return null;
  return <Stats />;
};

export default StatsWithShortcut;
