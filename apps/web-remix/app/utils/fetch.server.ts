import merge from 'lodash.merge';
import { LRUCache } from 'lru-cache';
import type { z, ZodType } from 'zod';

import {
  NotFoundError,
  UnauthorizedError,
  UnknownAPIError,
  ValidationError,
} from './errors';

const cache = new LRUCache<string, Response>({ max: 500 });

export async function fetchTyped<T extends ZodType>(
  schema: T,
  url: string,
  options?: (RequestInit & { requestCacheId?: string | null }) | undefined,
): Promise<ParsedResponse<z.infer<T>>> {
  let cachedResponse: Response | undefined;
  if (
    (!options?.method || options.method === 'GET') &&
    options?.requestCacheId
  ) {
    cachedResponse = cache.get(options.requestCacheId + url);
  }

  let response = await fetch(
    url,
    merge(options || {}, {
      headers: {
        connection: 'keep-alive',
        'if-none-match': cachedResponse?.headers.get('etag'),
      },
    }),
  ).catch((e) => {
    console.error(
      `Failed to connect to API error: ${e} during request to ${url}`,
    );
    throw new UnknownAPIError();
  });

  if (
    (!options?.method || options.method === 'GET') &&
    response.status === 200 &&
    options?.requestCacheId
  ) {
    cache.set(options.requestCacheId + url, response.clone());
  }

  if (response.status === 304) {
    response = cachedResponse?.clone()!;
  }

  if (!response.ok) {
    if (response.status === 422) {
      const jsonResponse = await response.json();
      throw new ValidationError(deepMergeAPIErrors(jsonResponse.errors));
    } else if (response.status === 401) {
      throw new UnauthorizedError();
    } else if (response.status === 404) {
      throw new NotFoundError();
    } else {
      console.error(await response.text());
      console.error(`Unknown API error ${response.status} for ${url}`);
      throw new UnknownAPIError();
    }
  }

  if (response.status === 204) {
    return Object.assign(response, { data: {}, error: null });
  }

  const jsonResponse = await response.json();

  const data = schema.parse(jsonResponse);

  return Object.assign(response, { data, error: null });
}

export type ParsedResponse<T> = Response & { data: T };

function deepMergeAPIErrors(
  errors: Record<string, APIErrorField>,
  contextKey = '',
): Record<string, ErrorField> {
  const result: Record<string, ErrorField> = {};

  for (const [key, value] of Object.entries(errors)) {
    const newContextKey = contextKey ? `${contextKey}.${key}` : key;

    if (Array.isArray(value)) {
      result[newContextKey] = value.join(', ');
    } else if (typeof value === 'string') {
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
