import { ZodType, z } from "zod";
import {
  UnauthorizedError,
  UnknownAPIError,
  ValidationError,
} from "./errors.server";

export async function fetchTyped<T extends ZodType>(
  schema: T,
  url: string,
  options?: RequestInit | undefined
): Promise<ParsedResponse<z.infer<T>>> {
  const response = await fetch(url, options).catch((e) => {
    throw new UnknownAPIError();
  });

  if (!response.ok) {
    if (response.status === 422) {
      const jsonResponse = await response.json();
      throw new ValidationError(deepMergeAPIErrors(jsonResponse.errors));
    } else if (response.status === 401) {
      throw new UnauthorizedError();
    } else {
      throw new UnknownAPIError();
    }
  }

  const jsonResponse = await response.json();

  const data = schema.parse(jsonResponse);

  return Object.assign(response, { data, error: null });
}

type ParsedResponse<T> = Response & { data: T };

function deepMergeAPIErrors(
  errors: Record<string, APIErrorField>,
  contextKey = ""
): Record<string, ErrorField> {
  const result: Record<string, ErrorField> = {};

  for (const [key, value] of Object.entries(errors)) {
    const newContextKey = contextKey ? `${contextKey}.${key}` : key;

    if (Array.isArray(value)) {
      result[newContextKey] = value.join(", ");
    } else if (typeof value === "string") {
      result[newContextKey] = value;
    } else {
      Object.assign(result, deepMergeAPIErrors(value, newContextKey));
    }
  }

  return result;
}

type APIErrorField =
  | string[]
  | APIErrorField[]
  | { [key: string]: APIErrorField };

type ErrorField = string;
