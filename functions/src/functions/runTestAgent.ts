import * as functions from "firebase-functions";
import { openExecuteTestAgent, OpenTestAgentArgs } from "../testAgents";

const runTestAgent = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 540,
  })
  .firestore.document("testAgentCalls/{callId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    let executionResult;
    snap.ref.update({
      status: "executing",
    });
    try {
      console.log("executing with data", data);
      executionResult = await openExecuteTestAgent(
        data.params as OpenTestAgentArgs
      );
      console.log("done executing");
    } catch (e) {
      console.error(e);
      await snap.ref.update({
        status: "error",
        // @ts-ignore
        error: e.toString(),
      });
      return;
    }

    await snap.ref.update({
      status: "success",
      result: executionResult,
    });
  });

export default runTestAgent;
