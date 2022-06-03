const Sentry = require("@sentry/serverless");
// or use es6 import statements
// import * as Sentry from '@sentry/node';

require("@sentry/tracing");
// or use es6 import statements
// import * as Tracing from '@sentry/tracing';

Sentry.GCPFunction.init({
  dsn:
    "https://767925c70ccc4ff8b3294fc457d6d1dd@o513412.ingest.sentry.io/5615384",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

export const logError = (error: Error) => {
  Sentry.captureException(error);
  console.error(error);
};
