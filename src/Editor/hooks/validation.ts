import { FormErrors } from "Editor/types";
import { ObjectSchema, ValidationError } from "yup";

interface ValidationResult<T> {
  errors: FormErrors<T>;
  valid: boolean;
}

const parseMessage = (messageString: string) => {
  return messageString.slice(messageString.indexOf(" ") + 1);
};

const formatErrors = <T>(errors: ValidationError[]): FormErrors<T> => {
  const result: FormErrors<T> = {};
  errors.forEach((error) => {
    const path = error.path.split(".");

    let node: FormErrors<T> = result;

    path.forEach((pathPart, i) => {
      const pathPartAsKey = pathPart as keyof T;
      if (!node[pathPartAsKey]) {
        // @ts-ignore
        node[pathPartAsKey] = {};
      }
      if (i === path.length - 1) {
        // @ts-ignore
        node[pathPartAsKey] = parseMessage(error.message);
      }
      // @ts-ignore
      node = node[pathPartAsKey] as FormErrors<T>;
    });
  });

  return result;
};

export const runValidation = async <T>(
  values: T,
  schema: ObjectSchema
): Promise<ValidationResult<T>> => {
  try {
    await schema.validate(values, {
      stripUnknown: true,
      abortEarly: false,
      strict: true,
    });
    // console.log("succeeded, continuing");

    return {
      valid: true,
      errors: {},
    };
  } catch (e) {
    // console.log("got errors");
    const asValidationError = e as ValidationError;
    return {
      errors: formatErrors(asValidationError.inner),
      valid: false,
    };
  }
};
