import React from "react";
import TestAgents from "./components/TestAgents";
import Spaces from "./components/Spaces";
import Invites from "./components/Invites";
import Layout from "./Layout";
import System from "./components/System";
import DbMigrations from "./components/DbMigrations";

const Routes = ({
  section,
}: {
  section: "test-agents" | "spaces" | "invites" | "system" | "db-migrations";
}) => {
  return (
    <Layout section={section}>
      <>
        {section === "test-agents" && <TestAgents />}
        {section === "spaces" && <Spaces />}
        {section === "invites" && <Invites />}
        {section === "system" && <System />}
        {section === "db-migrations" && <DbMigrations />}
      </>
    </Layout>
  );
};

export default Routes;
