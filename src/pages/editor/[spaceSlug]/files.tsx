import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "Editor/Head";
import { AnimatedAriumLogo } from "Space/AnimatedAriumLogo";

const Routes = dynamic(() => import("../../../Editor/Routes"), {
  loading: () => <AnimatedAriumLogo hint="Loading editor..." />,
  ssr: false,
});

const Files = () => {
  const router = useRouter();

  const { spaceSlug } = router.query;

  return (
    <>
      <Head section="Files" spaceId={spaceSlug as string} />
      <Routes spaceSlug={spaceSlug as string} section="files" />
    </>
  );
};

export default Files;
