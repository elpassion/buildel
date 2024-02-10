import fs from "node:fs";
import url from "node:url";
import path from "node:path";
import fastify from "fastify";
import { createRequestHandler, getEarlyHintLinks } from "@mcansh/remix-fastify";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import { fastifyEarlyHints } from "@fastify/early-hints";
import { fastifyStatic } from "@fastify/static";
import { fastifyHttpProxy } from "@fastify/http-proxy"
import fastifyMetrics from "fastify-metrics"

installGlobals();

let __dirname = url.fileURLToPath(new URL(".", import.meta.url));
let BUILD_PATH = "./build/index.js";
let VERSION_PATH = "./build/version.txt";

/** @typedef {import('@remix-run/node').ServerBuild} ServerBuild */

/** @type {ServerBuild} */
let initialBuild = await import(BUILD_PATH);

let handler;

let port = process.env.PORT ? Number(process.env.PORT) || 3000 : 3000;

if (process.env.NODE_ENV === "development") {
  process.env.PAGE_URL = `http://localhost:${port}`;
  handler = await createDevRequestHandler(initialBuild);
} else {
  handler = createRequestHandler({
    build: initialBuild,
    mode: initialBuild.mode,
  });
}

let app = fastify({
  logger: true,
});

await app.register(fastifyEarlyHints, { warn: true });

await app.register(fastifyHttpProxy, {
  upstream: process.env.API_URL,
  prefix: "/super-api/socket",
  rewritePrefix: "/socket",
  websocket: true
})

await app.register(fastifyHttpProxy, {
  upstream: "https://plausible.io",
  prefix: "/api/event",
  rewritePrefix: "/api/event"
})

await app.register(fastifyHttpProxy, {
  upstream: process.env.API_URL,
  prefix: "/super-api",
  rewritePrefix: "/api"
})

await app.register(fastifyHttpProxy, {
  upstream: "https://plausible.io/js",
  prefix: "/statistics",
  rewritePrefix: ""
})

await app.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
  wildcard: false,
  cacheControl: true,
  dotfiles: "allow",
  etag: true,
  maxAge: "1h",
  serveDotFiles: true,
  lastModified: true,
});

await app.register(fastifyStatic, {
  root: path.join(__dirname, "public", "build"),
  prefix: "/build",
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

app.register(async function (childServer) {
  childServer.removeAllContentTypeParsers();

  // allow all content types
  childServer.addContentTypeParser("*", (_request, payload, done) => {
    done(null, payload);
  });

  // handle SSR requests
  childServer.all("*", async (request, reply) => {
    if (process.env.NODE_ENV === "production") {
      let links = getEarlyHintLinks(request, initialBuild);
      await reply.writeEarlyHintsLinks(links);
    }

    try {
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
const metricsAddrers = await metricsApp.listen({ port: metricsPort, host: "0.0.0.0" })
console.log(`✅ metrics ready: ${metricsAddrers}`)

if (process.env.NODE_ENV === "development") {
  await broadcastDevReady(initialBuild);
}

/**
 * @param {ServerBuild} initialBuild
 * @param {import('@mcansh/remix-fastify').GetLoadContextFunction} [getLoadContext]
 * @returns {Promise<import('@mcansh/remix-fastify').RequestHandler>}
 */
async function createDevRequestHandler(initialBuild, getLoadContext) {
  let build = initialBuild;

  async function handleServerUpdate() {
    // 1. re-import the server build
    build = await reimportServer();
    // 2. tell Remix that this app server is now up-to-date and ready
    await broadcastDevReady(build);
  }

  let chokidar = await import("chokidar");
  chokidar
    .watch(VERSION_PATH, { ignoreInitial: true })
    .on("add", handleServerUpdate)
    .on("change", handleServerUpdate);

  return async (request, reply) => {
    let links = getEarlyHintLinks(request, build);
    await reply.writeEarlyHintsLinks(links);

    return createRequestHandler({
      build: await build,
      getLoadContext,
      mode: "development",
    })(request, reply);
  };
}

/** @returns {Promise<ServerBuild>} */
async function reimportServer() {
  let stat = fs.statSync(BUILD_PATH);

  // convert build path to URL for Windows compatibility with dynamic `import`
  let BUILD_URL = url.pathToFileURL(BUILD_PATH).href;

  // use a timestamp query parameter to bust the import cache
  return import(BUILD_URL + "?t=" + stat.mtimeMs);
}
