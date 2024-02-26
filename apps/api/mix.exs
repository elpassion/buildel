defmodule Buildel.MixProject do
  use Mix.Project

  def project do
    [
      app: :buildel,
      version: "0.1.0",
      elixir: "~> 1.14",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps()
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Buildel.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:bcrypt_elixir, "~> 3.0"},
      {:phoenix, "~> 1.7.7"},
      {:phoenix_ecto, "~> 4.4"},
      {:ecto_psql_extras, "~> 0.6"},
      {:ecto_sql, "~> 3.10"},
      {:postgrex, ">= 0.0.0"},
      {:phoenix_live_dashboard, "~> 0.8.0"},
      {:swoosh, "~> 1.3"},
      {:finch, "~> 0.13"},
      {:hackney, "~> 1.17"},
      {:telemetry_metrics, "~> 0.6"},
      {:telemetry_poller, "~> 1.0"},
      {:gettext, "~> 0.20"},
      {:jason, "~> 1.2"},
      {:plug_cowboy, "~> 2.5"},
      {:openai, "~> 0.5.4"},
      {:websockex, "~> 0.4.3"},
      {:essence, "~> 0.3.0"},
      {:httpoison, "~> 2.0"},
      {:cors_plug, "~> 3.0"},
      {:ex_json_schema, "~> 0.10.1"},
      {:uuid, "~> 1.1"},
      {:qdrant, "~> 0.0.8"},
      {:goal, "~> 0.3"},
      {:bumblebee, "~> 0.4"},
      {:nx, "~> 0.5"},
      {:exla, "~> 0.5"},
      {:erlport, "~>0.11"},
      {:poolboy, "~> 1.5"},
      {:cloak_ecto, "~> 1.2.0"},
      {:langchain, "~> 0.1.7"},
      {:pgvector, "~> 0.2.0"},
      {:dotenv, "~> 3.0.0"},
      {:money, "~> 1.12"},
      {:etag_plug, "~> 1.0"},
      {:exvcr, "~> 0.15.1", only: :test},
      {:joken, "~> 2.5"},
      {:joken_jwks, "~> 1.6"},
      {:resend, "~> 0.4.1"},
      {:open_api_spex, "~> 3.18"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "ecto.setup", "assets.setup", "assets.build"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"],
      "dependencies.up": [
        "cmd \"docker-compose -p buildel -f .docker/dev/docker-compose-dependencies.yml up\""
      ]
    ]
  end
end
