import url from "node:url";
import path from "node:path";
import fastify from "fastify";
import { createRequestHandler } from "@mcansh/remix-fastify";
import { installGlobals } from "@remix-run/node";
import { fastifyEarlyHints } from "@fastify/early-hints";
import { fastifyStatic } from "@fastify/static";
import { fastifyHttpProxy } from "@fastify/http-proxy";
import fastifyMetrics from "fastify-metrics";

installGlobals();

let port = process.env.PORT ? Number(process.env.PORT) || 3000 : 3000;

let vite =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );
let app = fastify();

let __dirname = url.fileURLToPath(new URL(".", import.meta.url));

if (vite) {
  process.env.PAGE_URL = `http://localhost:${port}`;

  let middie = await import("@fastify/middie").then((m) => m.default);
  await app.register(middie);
  await app.use(vite.middlewares);
} else {
  await app.register(fastifyStatic, {
    root: path.join(__dirname, "build", "client", "assets"),
    prefix: "/assets",
    wildcard: true,
    decorateReply: false,
    cacheControl: true,
    dotfiles: "allow",
    etag: true,
    maxAge: "1y",
    immutable: true,
    serveDotFiles: true,
    lastModified: true,
  });
}

await app.register(fastifyEarlyHints, { warn: true });

await app.register(fastifyHttpProxy, {
  upstream: process.env.API_URL,
  prefix: "/super-api/socket",
  rewritePrefix: "/socket",
  websocket: true,
});

await app.register(fastifyHttpProxy, {
  upstream: "https://plausible.io",
  prefix: "/api/event",
  rewritePrefix: "/api/event",
});

await app.register(fastifyHttpProxy, {
  upstream: process.env.API_URL,
  prefix: "/super-api",
  rewritePrefix: "/api",
});

await app.register(fastifyHttpProxy, {
  upstream: "https://plausible.io/js",
  prefix: "/statistics",
  rewritePrefix: "",
});

await app.register(fastifyStatic, {
  root: path.join(__dirname, "build", "client"),
  prefix: "/",
  wildcard: false,
  cacheControl: true,
  dotfiles: "allow",
  etag: true,
  maxAge: "1h",
  serveDotFiles: true,
  lastModified: true,
});

app.register(async function (childServer) {
  childServer.removeAllContentTypeParsers();
  // allow all content types
  childServer.addContentTypeParser("*", (_request, payload, done) => {
    done(null, payload);
  });

  // handle SSR requests
  childServer.all("*", async (request, reply) => {
    try {
      let handler = createRequestHandler({
        build: vite
          ? () => vite.ssrLoadModule("virtual:remix/server-build")
          : await import("./build/server/index.js"),
      });
      return handler(request, reply);
    } catch (error) {
      console.error(error);
      return reply.status(500).send(error);
    }
  });
});

let address = await app.listen({ port, host: "0.0.0.0" });
console.log(`✅ app ready: ${address}`);

const metricsPort = process.env.METRICS_PORT || 3010;
let metricsApp = fastify();
await metricsApp.register(fastifyMetrics, { endpoint: "/metrics" });
const metricsAddrers = await metricsApp.listen({
  port: metricsPort,
  host: "0.0.0.0",
});
console.log(`✅ metrics ready: ${metricsAddrers}`);

// if (process.env.NODE_ENV === "development") {
//   await broadcastDevReady(initialBuild);
// }
