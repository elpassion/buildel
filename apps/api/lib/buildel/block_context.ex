defmodule Buildel.BlockContextBehaviour do
  @type costs_data :: %{amount: integer(), input_tokens: integer(), output_tokens: integer()}

  @callback context_from_context_id(map()) :: map()
  @callback block_pid(String.t(), String.t()) :: pid()
  @callback create_run_auth_token(String.t(), String.t()) :: {:ok, String.t()}
  @callback create_run_cost(String.t(), String.t(), costs_data()) ::
              {:ok, Buildel.Pipelines.RunCost.t()}
  @callback get_vector_db(String.t(), String.t()) :: Buildel.VectorDB.t()
  @callback get_global_collection(String.t(), String.t()) :: {:ok, any(), String.t()}
  @callback get_secret_from_context(String.t(), String.t()) :: {:ok, String.t()}
  @callback get_dataset_from_context(String.t(), String.t()) :: any()
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
  def create_run_cost(context_id, block_name, costs_data) do
    %{global: organization_id, parent: pipeline_id, local: run_id} =
      context_from_context_id(context_id)

    with organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, pipeline} <-
           Buildel.Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Buildel.Pipelines.get_pipeline_run(pipeline, run_id),
         {:ok, cost} <-
           Buildel.Organizations.create_organization_cost(organization, costs_data),
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

  def create_run_and_collection_cost(context_id, block_name, tokens, collection_id) do
    %{global: organization_id, parent: pipeline_id, local: run_id} =
      context_from_context_id(context_id)

    with organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, collection_id),
         cost_amount <-
           Buildel.Costs.CostCalculator.calculate_embeddings_cost(
             %Buildel.Langchain.EmbeddingsTokenSummary{
               tokens: tokens,
               model: collection.embeddings_model,
               endpoint: collection.embeddings_endpoint
             }
           ),
         {:ok, pipeline} <-
           Buildel.Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Buildel.Pipelines.get_pipeline_run(pipeline, run_id),
         {:ok, cost} <-
           Buildel.Organizations.create_organization_cost(organization, %{
             amount: cost_amount,
             input_tokens: tokens,
             output_tokens: 0
           }),
         {:ok, run_cost} <-
           Buildel.Pipelines.create_run_cost(run, cost, %{
             description: block_name
           }),
         {:ok, collection_cost} <-
           Buildel.Memories.create_memory_collection_cost(collection, cost, %{
             cost_type: :query,
             description: "document_search"
           }) do
      {:ok, run_cost, collection_cost}
    else
      _ ->
        {:error, :not_found}
    end
  end

  @impl true
  def get_global_collection(context_id, collection_name) do
    %{global: organization_id} = context_from_context_id(context_id)
    organization = Buildel.Organizations.get_organization!(organization_id)

    {:ok, collection} =
      Buildel.Memories.get_organization_collection(organization, collection_name)

    {:ok, collection, Buildel.Memories.organization_collection_name(organization, collection)}
  end

  def create_memory(context_id, collection, file, metadata) do
    %{global: organization_id} = context_from_context_id(context_id)
    organization = Buildel.Organizations.get_organization!(organization_id)

    Buildel.Memories.create_organization_memory(
      organization,
      collection,
      file,
      metadata
    )
  end

  def delete_file(context_id, collection, file_id) do
    %{global: organization_id} = context_from_context_id(context_id)
    organization = Buildel.Organizations.get_organization!(organization_id)

    memory =
      Buildel.Memories.get_collection_memory_by_file_uuid!(organization, collection.id, file_id)

    Buildel.Memories.delete_organization_memory(organization, collection.id, memory.id)
  end

  @impl true
  def get_vector_db(context_id, collection_name) do
    %{global: organization_id} = context_from_context_id(context_id)
    organization = Buildel.Organizations.get_organization!(organization_id)

    {:ok, collection} =
      Buildel.Memories.get_organization_collection(organization, collection_name)

    api_key = get_secret_from_context(context_id, collection.embeddings_secret_name)

    vector_db =
      Buildel.VectorDB.new(%{
        adapter: Buildel.VectorDB.EctoAdapter,
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: collection.embeddings_api_type,
            model: collection.embeddings_model,
            api_key: api_key,
            endpoint: collection.embeddings_endpoint
          })
      })

    {:ok, vector_db}
  end

  @impl true
  def get_secret_from_context(%{global: organization_id}, secret_name) do
    with %Buildel.Organizations.Organization{} = organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, secret} <- Buildel.Organizations.get_organization_secret(organization, secret_name) do
      secret.value
    else
      _ -> nil
    end
  end

  @impl true
  def get_dataset_from_context(context_id, dataset_id) do
    with %{global: organization_id} = context_from_context_id(context_id),
         %Buildel.Organizations.Organization{} = organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, dataset} <- Buildel.Datasets.get_organization_dataset(organization, dataset_id) do
      dataset
    else
      _ -> nil
    end
  end
end
