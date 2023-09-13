FROM node:20-alpine AS base

ENV NODE_ENV production

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune --scope=web-remix --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
ENV PORT="8080"
ENV METRICS_PORT="8081"

RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store NODE_ENV=development pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=web-remix

RUN pnpm prune --prod

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 web
USER web


RUN rm -rf apps/web-remix/.env
CMD pnpm run -C apps/web-remix start