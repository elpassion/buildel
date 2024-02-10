import { createRemixStub } from "@remix-run/testing";

type RemixStubProps = Parameters<typeof createRemixStub>;

export const setupRoutes = (
  routes: RemixStubProps[0],
  ctx?: RemixStubProps[1]
) => createRemixStub(routes, ctx);
