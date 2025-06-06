# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :buildel,
  ecto_repos: [Buildel.Repo]

config :buildel, Buildel.Repo, types: Buildel.PostgrexTypes

# Configures the endpoint
config :buildel, BuildelWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [
    formats: [json: BuildelWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Buildel.PubSub,
  live_view: [signing_salt: "WY8jgGwk"]

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :buildel, Buildel.Mailer, adapter: Swoosh.Adapters.Local

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

config :phoenix, :filter_parameters, ["password", "auth"]

config :tesla, adapter: Tesla.Adapter.Hackney

config :money,
  default_currency: :USD

config :exla, :clients,
  tpu: [platform: :tpu],
  cuda: [platform: :cuda],
  rocm: [platform: :rocm],
  host: [platform: :host]

config :nx, :default_defn_options, compiler: EXLA
config :nx, :default_backend, EXLA.Backend

config :req, :default_options, pool_timeout: 60_000

config :buildel, :openai, Buildel.Clients.Openai
config :buildel, :deepgram, Buildel.Clients.Deepgram
config :buildel, :elevenlabs, Buildel.Clients.Elevenlabs
config :buildel, :webhook, Buildel.Clients.Webhook
config :buildel, :chat, Buildel.Clients.Chat
config :buildel, :file_loader, Buildel.FileLoaderNLMApiAdapter
config :buildel, :search_db, Buildel.SearchDB.EctoAdapter
config :buildel, :block_context_resolver, Buildel.BlockContext
config :buildel, :document_loader, Buildel.DocumentWorkflow.DocumentLoaderAdapter
config :buildel, :secure_cookie, false
config :buildel, :pipeline_logger, Buildel.Logs.DBPipelineLogger

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
