// import { GetServerSideProps, InferGetServerSidePropsType } from "next";
// import { FeaturedExperiencesResult } from "../../shared/sharedTypes";
// import NewMarketingSite from "../website/landing/NewMarketingSite";
// // import { getFunctionsBaseUrl } from "../libs/config";

// // const getFunctionUrl = () => `${getFunctionsBaseUrl()}/featuredExperiences`;

// export const getServerSideProps: GetServerSideProps = async ({ res }) => {
//   let featuredExperiences: FeaturedExperiencesResult;

//   try {
//     const functionUrl = getFunctionUrl();
//     const startTime = new Date().getTime();
//     featuredExperiences = await (await fetch(functionUrl)).json();

//     console.log("fetched in", (new Date().getTime() - startTime) / 1000);

//     res.setHeader(
//       "Cache-Control",
//       "public, s-maxage=30, stale-while-revalidate=59"
//     );
//   } catch (e) {
//     console.error(e);
//     featuredExperiences = {
//       experiences: [],
//     };
//   }

//   return {
//     props: { featuredExperiences }, // will be passed to the page component as props
//   };
// };

// const Index = (
//   props: InferGetServerSidePropsType<typeof getServerSideProps>
// ) => {
//   return <NewMarketingSite featuredExperiences={props.featuredExperiences} />;
// };

// export default Index;

import { FeaturedExperiencesResult } from "../../shared/sharedTypes";
import NewMarketingSite from "../website/landing/NewMarketingSite";
import featuredExperiencesJson from "../data/featuredExperiences.json";

// const getFunctionUrl = () => `${getFunctionsBaseUrl()}/featuredExperiences`;

const Index = () => {
  const featuredExperiences = featuredExperiencesJson as FeaturedExperiencesResult;
  return <NewMarketingSite featuredExperiences={featuredExperiences} />;
};

export default Index;
