FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN apk update

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS prod-deps
COPY ./pnpm-lock.yaml /app/pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --prod

COPY ./package.json /app/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --offline

FROM base AS build
COPY ./pnpm-lock.yaml /app/pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

COPY ./package.json /app/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline

COPY . /app

RUN pnpm run build

FROM base as release
ENV NODE_ENV production
ENV PORT="8080"
ENV METRICS_PORT="8081"

COPY --from=prod-deps /app/node_modules /app/node_modules

COPY ./package.json /app/package.json
COPY ./pnpm-lock.yaml /app/pnpm-lock.yaml
COPY ./remix.config.js /app/remix.config.js
COPY ./server.mjs /app/server.mjs

COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 web
USER web

CMD [ "pnpm", "start" ]
