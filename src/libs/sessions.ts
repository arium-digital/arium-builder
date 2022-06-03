import randomString from "random-string";
export const randomSessionId = (length = 8) =>
  randomString({ length }).toLowerCase();
