import yargsLib from "yargs";
import { makeUserAdmin } from "./users";
process.env.GOOGLE_APPLICATION_CREDENTIALS = "../serviceAccount.json";

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargsLib
  .command<{ spaceName: string; email: string }>(
    "makeAdmin [email]",
    "make a user an admin",
    (yargs) => {
      return yargs
        .positional("email", {
          type: "string",
        })
        .demandOption("email");
    },
    (argv) => {
      console.log(`making user with email ${argv.email} an admin`);
      makeUserAdmin(argv.email);
    }
  )
  .demandCommand().argv;
