import { AnimatedAriumLogo } from "Space/AnimatedAriumLogo";
import dynamic from "next/dynamic";
import React from "react";
const MySpaces = dynamic(() => import("../website/components/MySpaces"), {
  loading: () => <AnimatedAriumLogo hint="Loading spaces..." />,
  ssr: false,
});

export default MySpaces;
