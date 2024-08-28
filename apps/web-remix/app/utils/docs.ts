export function buildDocsUrl(pathname: string) {
  return new URL(
    pathname,
    'https://docs.buildel.ai/docs/blocks/api_call_tool',
  ).toString();
}
