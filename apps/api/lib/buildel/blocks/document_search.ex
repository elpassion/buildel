defmodule Buildel.Blocks.DocumentSearch do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :query
  defdelegate text_output(), to: Buildel.Blocks.Block
  defdelegate text_input(name), to: Buildel.Blocks.Block
  defdelegate file_input(name, public), to: Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "document_search",
      groups: ["file", "memory"],
      inputs: [file_input("files", true), text_input("query")],
      outputs: [text_output()],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["api_key", "persist_in", "forwarded_results_count", "hybrid_reranking"],
            "properties" => %{
              # "api_key" => %{
              #   "type" => "string",
              #   "title" => "API Key",
              #   "description" => "Select from your API keys or enter a new one.",
              #   "minLength" => 1,
              #   "presentAs" => "password"
              # },
              "persist_in" => %{
                "type" => "string",
                "title" => "Persist in",
                "url" => "/api/organizations/:organization_id/memory_collections",
                "presentAs" => "async-select",
                "description" =>
                  "Where to hold data from inputs.",
                "default" => ":pipeline_id_:block_name"
              },
              "forwarded_results_count" => %{
                "type" => "number",
                "title" => "Forwarded results count",
                "description" => "Up to how many results to forward to the output.",
                "default" => 2,
                "minimum" => 1,
                "maximum" => 5,
                "step" => 1
              },
              "hybrid_reranking" => %{
                "type" => "boolean",
                "title" => "Hybrid reranking",
                "description" =>
                  "Whether to rerank results using hybrid encoding model. This will increase the latency of the query.",
                "default" => false
              }
            }
          })
      }
    }
  end

  # Client

  def query(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:query, text})
  end

  def add_file(pid, file) do
    GenServer.cast(pid, {:add_file, file})
  end

  # Server

  @impl true
  def init(
        [
          name: name,
          block_name: block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, opts.inputs ++ ["#{block_name}:files"])

    %{global: global, parent: parent, local: local} =
      Buildel.Pipelines.Worker.context_from_context_id(context_id)

    collection_name =
      case opts.persist_in do
        "run" -> "#{global}_#{parent}_#{local}_#{block_name}"
        "workflow" -> "#{global}_#{parent}_#{block_name}"
        collection_name -> "#{global}_#{collection_name}"
      end

    with {:ok, collection} <- Buildel.VectorDB.init(collection_name) do
      {:ok,
       state
       |> assign_stream_state
       |> Keyword.put(:collection, collection.name)
       |> Keyword.put(:api_key, opts |> Map.get(:api_key))}
    else
      {:error, error} ->
        {:stop, "Failed to create collection #{inspect(name)} Error: #{inspect(error)}"}
    end
  end

  @impl true
  def handle_cast({:query, {:text, query}}, state) do
    state = send_stream_start(state)

    results =
      if state[:opts][:hybrid_reranking] do
        Buildel.HybridDB.query(state[:collection], query)
      else
        Buildel.VectorDB.query(state[:collection], query, api_key: state[:api_key])
      end

    result =
      results
      |> Enum.take(state[:opts].forwarded_results_count)
      |> Enum.map(fn %{
                       "document" => document,
                       "metadata" => %{"file_name" => filename}
                     } ->
        "File: #{filename}\n\n#{document |> String.trim()}"
      end)
      |> Enum.join("\n\n---\n\n")

    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "output",
      {:text, result}
    )

    state = send_stream_stop(state)

    {:noreply, state}
  end

  def handle_cast({:add_file, {:binary, file}}, state) do
    state = send_stream_start(state)

    documents =
      Buildel.Splitters.recursive_character_text_split(file, %{
        chunk_size: 1000,
        chunk_overlap: 200
      })
      |> Enum.map(fn document ->
        %{
          document: document,
          metadata: %{memory_id: "TODO: FIX", chunk_id: UUID.uuid4()}
        }
      end)

    Buildel.VectorDB.add(state[:collection], documents, api_key: state[:api_key])
    state = send_stream_stop(state)
    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :binary, binary}, state) do
    add_file(self(), {:binary, binary})
    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    input(self(), {:text, text})

    {:noreply, state}
  end
end
