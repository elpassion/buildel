defmodule Buildel.BlockContextBehaviour do
  @callback context_from_context_id(String.t()) :: map()
  @callback block_pid(String.t(), String.t()) :: pid()
  @callback create_run_auth_token(String.t(), String.t()) :: {:ok, String.t()}
  @callback create_run_cost(String.t(), String.t(), integer()) ::
              {:ok, Buildel.Pipelines.RunCost.t()}
  @callback global_collection_name(String.t(), String.t()) :: String.t()
end

defmodule Buildel.BlockContext do
  alias Buildel.Repo
  alias Buildel.Pipelines.Run

  @behaviour Buildel.BlockContextBehaviour

  @impl true
  def context_from_context_id(context_id) do
    ["organizations", organization_id, "pipelines", pipeline_id, "runs", run_id] =
      String.split(context_id, ":")

    %{
      global: organization_id,
      parent: pipeline_id,
      local: run_id
    }
  end

  @impl true
  def block_pid(context_id, block_name) do
    context = context_from_context_id(context_id)
    run = Repo.get!(Run, context[:local])
    Buildel.Pipelines.Runner.block_pid(run, block_name)
  end

  @impl true
  def create_run_auth_token(context_id, string) do
    %{global: organization_id} = context_from_context_id(context_id)

    with secret when is_binary(secret) <-
           Buildel.Organizations.get_organization!(organization_id).api_key do
      {:ok, :crypto.mac(:hmac, :sha256, secret, string) |> Base.encode64()}
    else
      _ -> {:error, :not_found}
    end
  end

  @impl true
  def create_run_cost(context_id, block_name, amount) do
    %{global: organization_id, parent: pipeline_id, local: run_id} =
      context_from_context_id(context_id)

    with organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, pipeline} <-
           Buildel.Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Buildel.Pipelines.get_pipeline_run(pipeline, run_id),
         {:ok, cost} <-
           Buildel.Organizations.create_organization_cost(organization, %{amount: amount}),
         {:ok, run_cost} <-
           Buildel.Pipelines.create_run_cost(run, cost, %{
             description: block_name
           }) do
      {:ok, run_cost}
    else
      _ ->
        {:error, :not_found}
    end
  end

  @impl true
  def global_collection_name(context_id, collection_name) do
    %{global: organization_id} = context_from_context_id(context_id)

    "#{organization_id}_#{collection_name}"
  end
end
