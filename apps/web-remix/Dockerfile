FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN apk update

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS prod-deps
COPY ./pnpm-lock.yaml /app/pnpm-lock.yaml

WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --prod

COPY . /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --offline

FROM base AS build
COPY ./pnpm-lock.yaml /app/pnpm-lock.yaml

WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

COPY . /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline

RUN pnpm run build

FROM base
COPY . /app
WORKDIR /app

ENV NODE_ENV production
ENV PORT="8080"
ENV METRICS_PORT="8081"

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 web
USER web

CMD [ "pnpm", "start" ]
