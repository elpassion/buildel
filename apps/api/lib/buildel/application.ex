defmodule Buildel.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children =
      [
        # Start the Telemetry supervisor
        BuildelWeb.Telemetry,
        # Start the PubSub system
        {Phoenix.PubSub, name: Buildel.PubSub},
        # Start Finch
        {Finch, name: Buildel.Finch},
        # Start the Endpoint (http/https)
        BuildelWeb.Endpoint,
        # Start a worker by calling: Buildel.Worker.start_link(arg)
        Buildel.Pipelines.Runner,
        # Start document cache
        Buildel.DocumentCache,
        # Start the vault used for encryption
        Buildel.Vault,
        # JWKS storage
        BuildelWeb.GoogleJwksStrategy
      ]
      |> maybe_add_db()
      |> maybe_add_bumblebee_embedding()
      |> maybe_add_python_workers()

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

  def load_servings() do
    if should_add_bumblebee_embedding?() do
      Buildel.Clients.BumblebeeEmbeddings.serving()
    end
  end

  defp maybe_add_db(children) do
    if System.get_env("SKIP_DB") do
      children
    else
      children ++
        [
          # Start the Ecto repository
          Buildel.Repo
        ]
    end
  end

  defp maybe_add_bumblebee_embedding(children) do
    if should_add_bumblebee_embedding?() do
      children ++
        [
          {Nx.Serving,
           serving: Buildel.Clients.BumblebeeEmbeddings.serving(),
           name: Buildel.Clients.BumblebeeEmbeddings,
           batch_timeout: 50}
        ]
    else
      children
    end
  end

  defp maybe_add_python_workers(children) do
    if Application.get_env(:buildel, :file_loader) == Buildel.FileLoaderUnstructuredLocalAdapter do
      children ++
        [
          :poolboy.child_spec(:worker, python_poolboy_config())
        ]
    else
      children
    end
  end

  defp should_add_bumblebee_embedding?() do
    false
  end

  defp python_poolboy_config() do
    [
      {:name, {:local, :python_worker}},
      {:worker_module, Buildel.PythonWorker},
      {:size, 2},
      {:max_overflow, 0}
    ]
  end
end
