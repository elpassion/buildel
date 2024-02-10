import { createRemixStub, RemixStubProps } from "@remix-run/testing";

type RemixRoutesProps = Parameters<typeof createRemixStub>;

export const setupRoutes = (
  routes: RemixRoutesProps[0],
  ctx?: RemixRoutesProps[1]
) => createRemixStub(routes, ctx);

export type RoutesProps = RemixStubProps;
