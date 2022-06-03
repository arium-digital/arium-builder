import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { AnimatedAriumLogo } from "components/AnimatedAriumLogo";

const Routes = dynamic(() => import("../../../Editor/Routes"), {
  loading: () => <AnimatedAriumLogo hint="Loading editor..." />,
  ssr: false,
});

const SpaceEvents = () => {
  const router = useRouter();
  const { spaceSlug } = router.query;

  return <Routes spaceSlug={spaceSlug as string} section="events" />;
};

export default SpaceEvents;
