import * as yargsLib from "yargs";
import {
  openExecuteTestAgent,
  openMultiExecuteTesteAgent,
  OpenTestAgentArgs,
  MultiTesteAgentExecuteArgs,
} from "./testAgents";

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargsLib
  .command<OpenTestAgentArgs>(
    "open [url] [instanceId] [duration] [video] [x] [z]",
    "open an instance in headless mode with a test video",
    // @ts-ignore
    (yargs) => {
      return yargs
        .positional("url", {
          type: "string",
          default: "https://arium.xyz",
        })
        .positional("instanceId", {
          type: "string",
          default: "empty",
        })
        .positional("duration", {
          type: "number",
          default: 60,
        })
        .positional("video", {
          type: "string",
        })
        .positional("x", {
          type: "number",
        })
        .positional("z", {
          type: "number",
        });
    },
    // @ts-ignore
    (argv) => {
      openExecuteTestAgent(argv);
    }
  )
  .command<MultiTesteAgentExecuteArgs>(
    "openmulti [url] [instanceId] [numberInstances] [duration]",
    "open x number of vlts instances",
    // @ts-ignore
    (yargs) => {
      return yargs
        .positional("url", {
          type: "string",
          default: "https://alpha.vlts.nyc",
        })
        .positional("instanceId", {
          type: "string",
          default: "empty",
        })
        .positional("numberInstances", {
          type: "number",
          default: 5,
        })
        .positional("duration", {
          type: "number",
          default: 40,
        });
    },
    // @ts-ignore
    (argv) => {
      openMultiExecuteTesteAgent(argv);
    }
  )
  .demandCommand().argv;
