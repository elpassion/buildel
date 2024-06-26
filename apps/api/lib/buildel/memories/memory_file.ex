defmodule Buildel.Memories.MemoryFile do
  defmodule FileUpload do
    defstruct [:id, :status, :upload, :chunks, :metadata, :reason]

    def new(id, upload) do
      %FileUpload{
        id: id,
        status: :processing,
        upload: upload,
        metadata:
          Buildel.FileLoader.file_properties(%{
            path: upload |> Map.get(:path),
            type: upload |> Map.get(:content_type, "txt"),
            name: upload |> Map.get(:filename)
          })
      }
    end

    def success(state, chunks) do
      %{state | status: :success, chunks: chunks}
    end

    def error(state, error) do
      %{state | status: :error, reason: error}
    end

    def content(state) do
      state.chunks |> Enum.map_join("\n", &Map.get(&1, :value))
    end
  end

  defmodule State do
    defstruct files: %{}

    def new(files \\ %{}) do
      %State{files: files}
    end

    def add_file(%State{} = state, file) do
      %{state | files: state.files |> Map.put(file.file.id, file)}
    end

    def update_file(%State{} = state, file) do
      %{state | files: state.files |> Map.put(file.file.id, file)}
    end

    def remove_file(%State{} = state, file_id) do
      %{state | files: state.files |> Map.delete(file_id)}
    end
  end

  use GenServer

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  def init(_args) do
    Process.flag(:max_heap_size, 0)
    {:ok, State.new(%{})}
  end

  def create(
        %Buildel.Organizations.Organization{} = organization,
        %Buildel.Memories.MemoryCollection{} = collection,
        upload
      ) do
    id = UUID.uuid4()

    file = FileUpload.new(id, upload)

    :ok = GenServer.call(__MODULE__, {:process_file, organization.id, collection.id, file})

    {:ok, file}
  end

  def get(file_id) do
    GenServer.call(__MODULE__, {:get_file, file_id})
  end

  def update_file(file) do
    GenServer.call(__MODULE__, {:update_file, file})
  end

  def handle_call({:get_file, file_id}, _from, state) do
    case state.files |> Map.get(file_id) do
      nil -> nil
      file -> file.file
    end
    |> then(&{:reply, {:ok, &1}, state})
  end

  def handle_call({:update_file, file}, _from, state) do
    Process.send_after(self(), {:remove_file, file.file.id}, 5 * 60_000)
    state |> State.update_file(file) |> then(&{:reply, :ok, &1})
  end

  def handle_call({:process_file, organization_id, collection_id, file}, _from, state) do
    state
    |> State.add_file(%{
      organization_id: organization_id,
      collection_id: collection_id,
      file: file
    })
    |> then(fn state ->
      Task.start(fn ->
        case process_file(state.files |> Map.get(file.id)) do
          {:ok, file} ->
            update_file(file)
        end
      end)

      {:reply, :ok, state}
    end)
  end

  def handle_info({:remove_file, file_id}, state) do
    state
    |> State.remove_file(file_id)
    |> then(&{:noreply, &1})
  end

  defp process_file(%{organization_id: organization_id, collection_id: collection_id, file: file}) do
    metadata = file.metadata

    with organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, collection_id),
         {:ok, api_key} <-
           Buildel.Organizations.get_organization_secret(
             organization_id,
             collection.embeddings_secret_name
           ),
         organization_collection_name <-
           Buildel.Memories.organization_collection_name(organization_id, collection_id),
         workflow <-
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
           }),
         items when is_list(items) <-
           Buildel.DocumentWorkflow.read(
             workflow,
             {file.upload.path, %{type: metadata.file_type}}
           ),
         chunks when is_list(chunks) <-
           Buildel.DocumentWorkflow.build_node_chunks(workflow, items),
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
      file = FileUpload.success(file, chunks)

      {:ok,
       %{
         organization_id: organization_id,
         collection_id: collection_id,
         file: file
       }}
    else
      error ->
        {:ok,
         %{
           organization_id: organization_id,
           collection_id: collection_id,
           file: file |> FileUpload.error(error)
         }}
    end
  end
end
