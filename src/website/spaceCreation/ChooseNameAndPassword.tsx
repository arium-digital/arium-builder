import { store } from "db";

import * as yup from "yup";

export const slugFieldSchema = (existingSlug: string) =>
  yup
    .string()
    .required()
    .matches(
      /^([a-z0-9\\-])*$/,
      "Must contain only lowercase letters, numbers, and dashes"
    )
    .test(
      "checkIdExists",
      "space url is taken, please choose a different url",
      async (value) => {
        if (!value) return false;

        if (value === existingSlug) return true;

        const taken = await spaceSlugTaken(value);

        return !taken;
      }
    );

const spaceSlugTaken = async (spaceSlug: string) => {
  return (await store.collection("spaces").doc(spaceSlug).get()).exists;
};
