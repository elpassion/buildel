defmodule Buildel.Blocks.DocumentSearch do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :query

  @impl true
  def options() do
    %{
      type: "document_search",
      description: "A sophisticated module designed for efficient searching and retrieval of information from a collection of documents.",
      groups: ["file", "memory"],
      inputs: [Block.file_input("files", true), Block.text_input("query")],
      outputs: [Block.text_output()],
      ios: [],
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
            "required" => ["persist_in", "limit", "hybrid_reranking", "similarity_threshhold"],
            "properties" =>
              Jason.OrderedObject.new(
                persist_in: memory_schema(),
                limit: %{
                  "type" => "number",
                  "title" => "Limit",
                  "description" => "The maximum number of results to return.",
                  "default" => 3
                },
                similarity_threshhold: %{
                  "type" => "number",
                  "title" => "Similarity threshhold",
                  "description" => "The similarity threshhold to use for the search.",
                  "default" => 0.75,
                  "minimum" => 0.0,
                  "maximum" => 1.0,
                  "step" => 0.01
                },
                hybrid_reranking: %{
                  "type" => "boolean",
                  "title" => "Hybrid reranking",
                  "description" =>
                    "Whether to rerank results using hybrid encoding model. This will increase the latency of the query.",
                  "default" => false
                }
              )
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
        %{
          name: name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        } = state
      ) do
    subscribe_to_connections(context_id, state.connections)

    collection_name = block_context().global_collection_name(context_id, opts.persist_in)

    with {:ok, collection} <- Buildel.VectorDB.init(collection_name) do
      {:ok,
       state
       |> assign_stream_state
       |> Map.put(:collection, collection.name)
       |> Map.put(:api_key, opts |> Map.get(:api_key))}
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
        Buildel.VectorDB.query(state[:collection], query, %{
          api_key: state[:api_key],
          limit: state[:opts] |> Map.get(:limit, 3),
          similarity_threshhold: state[:opts] |> Map.get(:similarity_threshhold, 0.75)
        })
      end

    result =
      results
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
    cast(self(), {:text, text})

    {:noreply, state}
  end
end
