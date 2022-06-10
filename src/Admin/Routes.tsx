import React from "react";
import Invites from "./components/Invites";
import TestAgents from "./components/TestAgents";
import Layout from "./Layout";

const Routes = ({ section }: { section: "invites" | "test-agents" }) => {
  return (
    <Layout section={section}>
      <>
        {section === "invites" && <Invites />}
        {section === "test-agents" && <TestAgents />}
      </>
    </Layout>
  );
};

export default Routes;
