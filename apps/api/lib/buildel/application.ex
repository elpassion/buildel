defmodule Buildel.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      BuildelWeb.Telemetry,
      # Start the Ecto repository
      Buildel.Repo,
      # Start the PubSub system
      {Phoenix.PubSub, name: Buildel.PubSub},
      # Start Finch
      {Finch, name: Buildel.Finch},
      # Start the Endpoint (http/https)
      BuildelWeb.Endpoint,
      # Start a worker by calling: Buildel.Worker.start_link(arg)
      Buildel.Pipelines.Runner
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Buildel.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    BuildelWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
