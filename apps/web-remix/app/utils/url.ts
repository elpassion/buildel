import { isNotNil } from '~/utils/guards';

export function buildUrlWithParams(
  baseUrl: string,
  params?: Record<string, string | number | undefined>,
) {
  let url = baseUrl;

  if (!params) return url;

  const queryString = Object.entries(params)
    .filter(([, value]) => isNotNil(value))
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`,
    )
    .join('&');

  if (queryString.length > 0) {
    url += (baseUrl.includes('?') ? '&' : '?') + queryString;
  }

  return url;
}
