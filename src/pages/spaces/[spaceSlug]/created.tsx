import Head from "next/head";
import { AnimatedAriumLogo } from "Space/AnimatedAriumLogo";
import dynamic from "next/dynamic";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

const SpaceCreatedRoute = dynamic(
  () => import("website/spaceCreation/SpaceCreated"),
  {
    loading: () => <AnimatedAriumLogo hint="Loading..." />,
    ssr: false,
  }
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { spaceSlug } = context.query;

  if (!spaceSlug) throw new Error("missing space slug");

  return {
    props: {
      spaceId: spaceSlug,
    },
  };
};

const Created = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const spaceId = props.spaceId;

  if (!spaceId) throw new Error("missing spaceId");

  return (
    <>
      <Head>
        <title key="title">Your Space Has been Created</title>
      </Head>
      <SpaceCreatedRoute spaceId={spaceId as string} />
    </>
  );
};

export default Created;
