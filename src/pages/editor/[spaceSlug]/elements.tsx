import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "Editor/Head";
import { AnimatedAriumLogo } from "Space/AnimatedAriumLogo";

const Routes = dynamic(() => import("../../../Editor/Routes"), {
  loading: () => <AnimatedAriumLogo hint="Loading editor..." />,
  ssr: false,
});

const Elements = () => {
  const router = useRouter();

  const { spaceSlug } = router.query;

  return (
    <>
      <Head section="Elements" spaceId={spaceSlug as string} />
      <Routes spaceSlug={spaceSlug as string} section="elements" />
    </>
  );
};

export default Elements;
