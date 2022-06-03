import React from "react";
import SpaceSettings from "./components/SpaceSettings";
import Files from "./components/Files/List";
import Environment from "./components/Environment";
import Elements from "./components/Elements/Elements";
import Layout from "./Layout";
import EventsWIP from "./components/Events";
import useMinimalSpaceContext from "hooks/useMinimalSpaceContext";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import Theme from "./components/ThemeSettings";
import useSpaceIdForSlug from "hooks/useSpaceIdForSlug";

const Routes = ({
  spaceId,
  spaceSlug,
  section,
}: {
  spaceId: string;
  spaceSlug: string;
  section:
    | "space-settings"
    | "elements"
    | "environment"
    | "files"
    | "events"
    | "theme";
}) => {
  const spaceContext = useMinimalSpaceContext({ spaceId });

  return (
    <Layout spaceId={spaceId} spaceSlug={spaceSlug} section={section}>
      <SpaceContext.Provider value={spaceContext}>
        {section === "space-settings" && <SpaceSettings spaceId={spaceId} />}
        {section === "files" && <Files />}
        {section === "environment" && <Environment spaceId={spaceId} />}
        {section === "theme" && <Theme spaceId={spaceId} />}
        {section === "elements" && <Elements spaceId={spaceId} />}
        {section === "events" && <EventsWIP spaceId={spaceId} />}
      </SpaceContext.Provider>
    </Layout>
  );
};

const RoutesWrapper = ({
  spaceSlug,
  section,
}: {
  spaceSlug: string;
  section:
    | "space-settings"
    | "elements"
    | "environment"
    | "files"
    | "events"
    | "theme";
}) => {
  const { spaceId } = useSpaceIdForSlug(spaceSlug);

  if (!spaceId) return null;

  return <Routes spaceId={spaceId} spaceSlug={spaceSlug} section={section} />;
};

export default RoutesWrapper;
