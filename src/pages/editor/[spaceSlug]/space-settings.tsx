import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "Editor/Head";
import { AnimatedAriumLogo } from "components/AnimatedAriumLogo";

const Routes = dynamic(() => import("../../../Editor/Routes"), {
  loading: () => <AnimatedAriumLogo hint="Loading editor..." />,
  ssr: false,
});

const SpaceSettings = () => {
  const router = useRouter();

  const { spaceSlug } = router.query;

  return (
    <>
      <Head section="Environment" spaceId={spaceSlug as string} />
      <Routes spaceSlug={spaceSlug as string} section="space-settings" />
    </>
  );
};

export default SpaceSettings;
