import Config

# Only in tests, remove the complexity from the password hashing algorithm
config :bcrypt_elixir, :log_rounds, 1

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :buildel, Buildel.Repo,
  hostname: System.get_env("POSTGRES_HOST", "localhost"),
  port: String.to_integer(System.get_env("POSTGRES_PORT", "54321")),
  username: System.get_env("POSTGRES_USER", "postgres"),
  password: System.get_env("POSTGRES_PASSWORD", "postgres"),
  database: "buildel_test#{System.get_env("MIX_TEST_PARTITION")}",
  pool: Ecto.Adapters.SQL.Sandbox

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :buildel, BuildelWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "3lFXc3u7P+9aRwdxRL/5htvvvgxIm7Rv8aX76Dav74uAiQenszoAImwIk/rpn9IP",
  server: false

# In test we don't send emails.
config :buildel, Buildel.Mailer, adapter: Swoosh.Adapters.Test

# Disable swoosh api client as it is only required for production adapters.
config :swoosh, :api_client, false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

config :buildel, :secret_key_base, "secret_key_base"

config :buildel, :deepgram, Buildel.ClientMocks.Deepgram
config :buildel, :elevenlabs, Buildel.ClientMocks.Elevenlabs
config :buildel, :webhook, Buildel.ClientMocks.Webhook
config :buildel, :chat, Buildel.ClientMocks.Chat
config :buildel, :stream_timeout, 10
config :buildel, :file_loader, Buildel.FileLoaderRawAdapter
config :buildel, :search_db, Buildel.ClientMocks.SearchDB.LNXAdapter
config :buildel, :block_context_resolver, Buildel.BlockContext.Mock
config :langchain, openai_key: fn -> System.get_env("OPENAI_API_KEY") end
config :buildel, :pipeline_logger, Buildel.ClientMocks.DBPipelineLogger
config :buildel, :http_api, Buildel.ClientMocks.HttpApi
config :buildel, :clock, Buildel.ClientMocks.Clock

config :buildel, :nlm_api_url, System.get_env("NLM_API_URL")

config :buildel, :document_loader, Buildel.DocumentWorkflow.DocumentLoaderTestAdapter

config :buildel, Buildel.Vault,
  ciphers: [
    default:
      {Cloak.Ciphers.AES.GCM,
       tag: "AES.GCM.V1", key: Base.decode64!("SXgbxNqc73TsknZpgmCNS51pJAinwb4EA3dnd8kYdup=")}
  ]

config :buildel, :page_url, "http://localhost:3000"
config :logger, level: :critical

config :buildel,
       :registration_disabled,
       System.get_env("REGISTRATION_DISABLED", "false") == "true"

config :buildel, :skip_flame, System.get_env("SKIP_FLAME", "true") == "true"
