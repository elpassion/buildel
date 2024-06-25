defmodule Buildel.Memories.MemoryFile do
  defmodule FileUpload do
    defstruct [:id, :status, :upload]

    def new(id, upload) do
      %FileUpload{id: id, status: :processing, upload: upload}
    end
  end

  defmodule State do
    defstruct [:files]

    def new(files) do
      %State{files: files}
    end
  end

  use GenServer

  def start_link(_opts \\ []) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(_args) do
    {:ok, State.new([])}
  end

  def create(
        %Buildel.Organizations.Organization{} = organization,
        %Buildel.Memories.MemoryCollection{} = collection,
        upload
      ) do
    id = UUID.uuid4()

    file = FileUpload.new(id, upload)

    GenServer.call(__MODULE__, {:process_file, organization, collection, file})

    {:ok, file}
  end

  def handle_call({:process_file, organization, collection, file}, _from, state) do
    properties =
      %{
        path: file.upload |> Map.get(:path),
        type: file.upload |> Map.get(:content_type, "txt"),
        name: file.upload |> Map.get(:filename)
      }

    metadata =
      Map.merge(
        %{},
        Buildel.FileLoader.file_properties(properties)
      )

    {:ok, api_key} =
      Buildel.Organizations.get_organization_secret(
        organization,
        collection.embeddings_secret_name
      )

    organization_collection_name =
      Buildel.Memories.organization_collection_name(organization, collection)

    workflow =
      Buildel.DocumentWorkflow.new(%{
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: collection.embeddings_api_type,
            model: collection.embeddings_model,
            api_key: api_key.value,
            endpoint: collection.embeddings_endpoint
          }),
        collection_name: organization_collection_name,
        db_adapter: Buildel.VectorDB.EctoAdapter,
        workflow_config: %{
          chunk_size: collection.chunk_size,
          chunk_overlap: collection.chunk_overlap
        }
      })

    document =
      Buildel.DocumentWorkflow.read(
        workflow,
        {file.path, %{type: metadata.file_type}}
      )

    with chunks when is_list(chunks) <-
           Buildel.DocumentWorkflow.build_node_chunks(workflow, document),
         %{chunks: chunks, embeddings_tokens: embeddings_tokens} when is_list(chunks) <-
           Buildel.DocumentWorkflow.generate_embeddings_for_chunks(workflow, chunks),
         cost_amount <-
           Buildel.Costs.CostCalculator.calculate_embeddings_cost(
             %Buildel.Langchain.EmbeddingsTokenSummary{
               tokens: embeddings_tokens,
               model: collection.embeddings_model
             }
           ),
         {:ok, cost} <-
           Buildel.Organizations.create_organization_cost(
             organization,
             %{
               amount: cost_amount,
               input_tokens: embeddings_tokens,
               output_tokens: 0
             }
           ),
         {:ok, _} <-
           Buildel.Memories.create_memory_collection_cost(collection, cost, %{
             cost_type: :file_upload,
             description: metadata.file_name
           }) do
      IO.inspect("processed")
    end

    # Process the file here
    {:noreply, state}
  end
end
