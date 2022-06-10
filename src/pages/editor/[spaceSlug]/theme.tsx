import { useRouter } from "next/router";
import DynamicRoutes from "../../../Editor/DynamicRoutes";
import Head from "Editor/Head";

const Theme = () => {
  const router = useRouter();

  const { spaceSlug } = router.query;

  return (
    <>
      <Head section="Theme" spaceId={spaceSlug as string} />
      <DynamicRoutes spaceSlug={spaceSlug as string} section="theme" />
    </>
  );
};

export default Theme;
