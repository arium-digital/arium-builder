import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { SpaceMetaResult } from "../../../../shared/sharedTypes";
import { AnimatedAriumLogo } from "Space/AnimatedAriumLogo";
import { SpaceRouteKeys } from "Space/SpaceRoute/useSpaceQueryParams";
import { getFunctionsBaseUrl } from "libs/config";
const SpaceRoute = dynamic(() => import("../../../Space/SpaceRoute"), {
  loading: () => <AnimatedAriumLogo hint="Loading space..." />,
  ssr: false,
});

const generateTitle = (name: string | undefined, spaceId: string) => {
  const titleToUse = name || spaceId;

  return `${titleToUse}`;
};

const generateMetaDescription = (name: string | undefined, spaceId: string) =>
  `Join ${name || spaceId}`;

const getFunctionUrl = (slug: string) =>
  `${getFunctionsBaseUrl()}/metadataFromSlug/${slug}`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { spaceSlug } = context.query;

  const portalTo = context.query[SpaceRouteKeys.portalTo];

  const spaceSlugToUse = portalTo || spaceSlug;

  let spaceMetaResult: SpaceMetaResult;

  try {
    const functionUrl = getFunctionUrl(spaceSlugToUse as string);
    spaceMetaResult = await (await fetch(functionUrl)).json();
  } catch (e) {
    console.error(e);
    spaceMetaResult = { doesNotExist: true };
  }

  if (!!spaceMetaResult.doesNotExist)
    return {
      props: { doesNotExist: true },
    };

  const result = {
    title: generateTitle(spaceMetaResult.name, spaceSlugToUse as string),
    metaImage: spaceMetaResult.metaImagePath || null,
    name: spaceMetaResult.name || null,
    metaDescription: generateMetaDescription(
      spaceMetaResult.name,
      spaceSlugToUse as string
    ),
    doesNotExist: !!spaceMetaResult.doesNotExist,
    requirePassword: spaceMetaResult.requirePassword || null,
    welcomeHTML: spaceMetaResult.welcomeHTML || null,
    spaceId: spaceMetaResult.spaceId,
    spaceSlug: spaceSlugToUse,
  };

  return {
    props: result, // will be passed to the page component as props
  };
};

const DynamicSpaceRoute = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const spaceId = props.spaceId;

  return (
    <>
      <Head>
        <title key="title">{props.title}</title>
        <meta property="og:title" content={props.title} key="og:title" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        {props.metaDescription && (
          <>
            <meta
              name="description"
              content={props.metaDescription}
              key="description"
            />
            <meta
              property="og:description"
              content={props.metaDescription}
              key="og:description"
            />
          </>
        )}
        {props.metaImage && (
          <meta property="og:image" content={props.metaImage} key="og:image" />
        )}
      </Head>
      <SpaceRoute
        spaceId={spaceId as string}
        requirePassword={props.requirePassword}
        spaceMetadata={props}
        spaceSlug={props.spaceSlug}
      />
    </>
  );
};

export default DynamicSpaceRoute;
