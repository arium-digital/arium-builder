import { TRANSFERABLE_TYPE } from "./createWorkerBlobUrl";

/* eslint-disable no-restricted-globals */
interface JOB_RUNNER_OPTIONS {
  fn: Function;
  transferable: TRANSFERABLE_TYPE;
}

/**
 * This function accepts as a parameter a function "userFunc"
 * And as a result returns an anonymous function.
 * This anonymous function, accepts as arguments,
 * the parameters to pass to the function "useArgs" and returns a Promise
 * This function can be used as a wrapper, only inside a Worker
 * because it depends by "postMessage".
 *
 * @param {Function} userFunc {Function} fn the function to run with web worker
 *
 * @returns {Function} returns a function that accepts the parameters
 * to be passed to the "userFunc" function
 */
const jobRunner = (options: JOB_RUNNER_OPTIONS): Function => (
  e: MessageEvent
) => {
  // const userFuncArgs = e.data as any
  const result = options.fn(e.data);
  postMessage(result);
};

export default jobRunner;
