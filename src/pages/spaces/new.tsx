import { AnimatedAriumLogo } from "Space/AnimatedAriumLogo";
import dynamic from "next/dynamic";
import Head from "next/head";

const SpaceCreationRoute = dynamic(() => import("website/spaceCreation"), {
  loading: () => <AnimatedAriumLogo />,
  ssr: false,
});

const SpaceCreationPage = () => {
  return (
    <>
      <Head>
        <title key="title">Create an Arium Space</title>
      </Head>
      <SpaceCreationRoute />
    </>
  );
};

export default SpaceCreationPage;
