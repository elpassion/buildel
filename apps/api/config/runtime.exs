import Config

if System.get_env("PHX_SERVER") do
  config :buildel, BuildelWeb.Endpoint, server: true
end

if log_level = System.get_env("LOG_LEVEL") do
  config :logger, level: String.to_atom(log_level)
end

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: ecto://USER:PASS@HOST/DATABASE
      """

  maybe_ipv6 = if System.get_env("ECTO_IPV6") in ~w(true 1), do: [:inet6], else: []

  config :buildel, Buildel.Repo,
    # ssl: true,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    socket_options: maybe_ipv6

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  host = System.get_env("PHX_HOST") || "example.com"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :buildel, :secret_key_base, secret_key_base

  config :buildel, BuildelWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base,
    check_origin: false

  config :qdrant,
    port: 6333,
    interface: "rest",
    database_url: System.get_env("QDRANT_DATABASE_URL"),
    api_key: "doesntmatter"

  config :buildel, Buildel.Vault,
    ciphers: [
      default:
        {Cloak.Ciphers.AES.GCM,
         tag: "AES.GCM.V1", key: System.get_env("ENCRYPTION_KEY") |> Base.decode64!()}
    ]

  config :langchain, openai_key: System.get_env("OPENAI_API_KEY")

  config :buildel, :basic_auth,
    username: System.get_env("BASIC_AUTH_USERNAME"),
    password: System.get_env("BASIC_AUTH_PASSWORD")

  config :buildel,
         :nlm_api_url,
         System.get_env("NLM_API_URL", "https://buildel-nlm-ingestor.fly.dev")

  config :buildel, :page_url, System.get_env("PAGE_URL")

  config :buildel, :document_loader, Buildel.DocumentWorkflow.DocumentLoaderAdapter

  config :buildel,
         :registration_disabled,
         System.get_env("REGISTRATION_DISABLED") == "true" || false

  config :buildel, :skip_flame, System.get_env("SKIP_FLAME") == "true" || true

  config :flame, :backend, FLAME.FlyBackend
  config :flame, FLAME.FlyBackend, token: System.get_env("FLY_API_TOKEN")

  if api_key = System.get_env("RESEND_API_KEY") do
    config :buildel, Buildel.Mailer,
      adapter: Resend.Swoosh.Adapter,
      api_key: api_key
  end

  if sentry_dsn = System.get_env("SENTRY_DSN") do
    config :sentry,
      dsn: sentry_dsn,
      environment_name: :prod,
      enable_source_code_context: true,
      root_source_code_paths: [File.cwd!()]
  end
end
