# Find eligible builder and runner images on Docker Hub. We use Ubuntu/Debian
# instead of Alpine to avoid DNS resolution issues in production.
#
# https://hub.docker.com/r/hexpm/elixir/tags?page=1&name=ubuntu
# https://hub.docker.com/_/ubuntu?tab=tags
#
# This file is based on these images:
#
#   - https://hub.docker.com/r/hexpm/elixir/tags - for the build image
#   - https://hub.docker.com/_/debian?tab=tags&page=1&name=bullseye-20230612-slim - for the release image
#   - https://pkgs.org/ - resource for finding needed packages
#   - Ex: hexpm/elixir:1.15.2-erlang-26.0.2-debian-bullseye-20230612-slim
#
ARG ELIXIR_VERSION=1.18.3

ARG OTP_VERSION=27.3.4

ARG DEBIAN_VERSION=bookworm-20250428-slim

ARG BUILDER_IMAGE="hexpm/elixir:${ELIXIR_VERSION}-erlang-${OTP_VERSION}-debian-${DEBIAN_VERSION}"
ARG RUNNER_IMAGE="debian:${DEBIAN_VERSION}"

FROM ${BUILDER_IMAGE} as builder

# install build dependencies
RUN apt-get update -y && apt-get install -y build-essential git curl jq \
  && apt-get clean && rm -f /var/lib/apt/lists/*_*

# prepare build dir
WORKDIR /app

# install hex + rebar
RUN mix local.hex --force && mix local.rebar --force

# set build ENV
ENV MIX_ENV="prod"
ENV BUMBLEBEE_CACHE_DIR=/app/.bumblebee

# install mix dependencies
COPY ./mix.exs ./mix.lock ./
RUN --mount=type=cache,id=hex,target=/root/.hex \
  --mount=type=cache,id=mix,target=/root/.mix \
  mix deps.get --only $MIX_ENV
RUN mkdir config

# install hex again
RUN mix local.hex --force && mix local.rebar --force

# copy compile-time config files before we compile dependencies
# to ensure any relevant config change will trigger the dependencies
# to be re-compiled.
COPY ./config/config.exs ./config/${MIX_ENV}.exs config/
RUN --mount=type=cache,id=hex,target=/root/.hex \
  --mount=type=cache,id=mix,target=/root/.mix \
  --mount=type=cache,id=xla,target=/root/.cache/xla \
  --mount=type=cache,id=rustler,target=/root/.cache/rustler_precompiled \
  mix deps.compile

COPY ./priv priv

COPY ./lib lib

# Compile the release
RUN mix compile

# Changes to config/runtime.exs don't require recompiling the code
COPY ./config/runtime.exs config/

COPY ./rel rel
RUN mix release

RUN DATABASE_URL="ecto://USER:PASS@HOST/DATABASE" SECRET_KEY_BASE="doesnotmatter" ENCRYPTION_KEY="ZG9lc25vdG1hdTEstg==" SKIP_DB="true" mix run -e 'Buildel.Application.load_servings()'

RUN mix sentry.package_source_code

RUN mkdir -p /app/.bumblebee

# start a new build stage so that the final image will only contain
# the compiled release and other runtime necessities
FROM ${RUNNER_IMAGE}

RUN apt-get update -y && apt-get install -y libstdc++6 openssl libncurses5 locales jq python3 python3-pip \
  && apt-get clean && rm -f /var/lib/apt/lists/*_*

RUN pip install umap-learn numpy psycopg2-binary --break-system-packages

# Set the locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

WORKDIR "/app"
RUN chown nobody /app

# set runner ENV
ENV MIX_ENV="prod"

# Only copy the final release from the build stage
COPY --from=builder --chown=nobody:root /app/.bumblebee/ ./.bumblebee
COPY --from=builder --chown=nobody:root /app/_build/${MIX_ENV}/rel/buildel ./

USER nobody

ENV BUMBLEBEE_CACHE_DIR=/app/.bumblebee
ENV BUMBLEBEE_OFFLINE=true

CMD ["/app/bin/server"]
