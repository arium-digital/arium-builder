import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { AnimatedAriumLogo } from "Space/AnimatedAriumLogo";
import { EventInfo } from "../../../shared/sharedTypes";
import { FourOFourSSR } from "Space/404";
import { getMetaImagePath } from "media/assetPaths";
import { getFunctionsBaseUrl } from "libs/config";
const EventRoute = dynamic(() => import("../../Events"), {
  loading: () => <AnimatedAriumLogo hint="Loading event..." />,
  ssr: true,
});

// note: cover path allows gs:// path
// const exampleEventInfo: EventInfo = {
//   eventType: "Exhibition Opening",
//   spaceId: "hack-of-a-bear",
//   slug: "test_event_1",
//   name: "Hack of a Bear",
//   hostName: "Hackatao",
//   abstract:
//     "Hackatao’s response to the masterpiece Head of a Bear by da Vinci is based on the concept of the continuum; a continuous sequence in which adjacent elements are not perceptibly different from each other, but the extremes are quite distinct. A never-ending pattern, a curve or geometrical figure.",
//   startTimestamp: 1627529439000,
//   endTimestamp: 1627529439000 + 1000 * 60 * 60 * 4, // 4 hour
// };

type EventQueryResult =
  | { exist: false; eventId: string; event?: undefined }
  | { exist: true; event: EventInfo & { coverUrl?: string } };
const queryEvent = async (eventId: string): Promise<EventQueryResult> => {
  const url = `${getFunctionsBaseUrl()}/getEventById/${eventId}`;
  const response = await fetch(url);
  if (response.status === 200) {
    const event: EventInfo = await response.json();
    if (event.startTimestamp && event.endTimestamp === undefined)
      event.endTimestamp = event.startTimestamp + 3600000;

    const coverUrl = getMetaImagePath(event.coverImage);
    if (event.coverImage) return { exist: true, event: { ...event, coverUrl } };
  }
  return { exist: false, eventId };
};
export const getServerSideProps: GetServerSideProps<EventQueryResult> = async (
  context
) => {
  const { eventId } = context.query;
  return { props: await queryEvent(eventId as string) };
};

const DynamicEventRoute = (result: EventQueryResult) => {
  if (!result.exist) return <FourOFourSSR type="event" id={result.eventId} />;
  const { event } = result;
  return (
    <>
      <Head>
        <title key="title">{event.name}</title>
        <meta property="og:title" content={event.name} key="og:title" />
        <meta name="twitter:card" content="summary_large_image" />
        {event.abstract && (
          <>
            <meta
              name="description"
              content={event.abstract}
              key="description"
            />
            <meta
              property="og:description"
              content={event.abstract}
              key="og:description"
            />
          </>
        )}
        {event.coverUrl && (
          <meta property="og:image" content={event.coverUrl} key="og:image" />
        )}
      </Head>
      <EventRoute event={event} />
    </>
  );
};

export default DynamicEventRoute;
