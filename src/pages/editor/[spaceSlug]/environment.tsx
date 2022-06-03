import { useRouter } from "next/router";
import DynamicRoutes from "../../../Editor/DynamicRoutes";
import Head from "Editor/Head";

const Environment = () => {
  const router = useRouter();

  const { spaceSlug } = router.query;

  return (
    <>
      <Head section="Environment" spaceId={spaceSlug as string} />
      <DynamicRoutes spaceSlug={spaceSlug as string} section="environment" />
    </>
  );
};

export default Environment;
