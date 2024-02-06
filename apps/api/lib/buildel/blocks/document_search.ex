defmodule Buildel.Blocks.DocumentSearch do
  use Buildel.Blocks.Block
  alias LangChain.Function

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :query

  @impl true
  def options() do
    %{
      type: "document_search",
      description:
        "Used for efficient searching and retrieval of information from a collection of documents inside Buildel Knowledge Base.",
      groups: ["file", "memory"],
      inputs: [Block.file_input("files", true), Block.text_input("query")],
      outputs: [Block.text_output()],
      ios: [Block.io("tool", "worker")],
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
            "required" => [
              "api_key",
              "knowledge",
              "limit",
              "hybrid_reranking",
              "similarity_threshhold"
            ],
            "properties" =>
              Jason.OrderedObject.new(
                api_key:
                  secret_schema(%{
                    "title" => "API key",
                    "description" => "OpenAI API key to use for the embeddings."
                  }),
                knowledge:
                  memory_schema(%{
                    "title" => "Knowledge",
                    "description" => "The knowledge to use for retrieval.",
                    "default" => ""
                  }),
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

  def query_sync(pid, {:text, _text} = text) do
    GenServer.call(pid, {:query, text})
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

    api_key =
      block_secrets_resolver().get_secret_from_context(context_id, opts |> Map.get(:api_key))

    collection_name = block_context().global_collection_name(context_id, opts.knowledge)

    with {:ok, collection} <- Buildel.VectorDB.init(collection_name) do
      {:ok,
       state
       |> assign_stream_state
       |> Map.put(:collection, collection.name)
       |> Map.put(:api_key, api_key)}
    else
      {:error, error} ->
        {:stop, "Failed to create collection #{inspect(name)} Error: #{inspect(error)}"}
    end
  end

  @impl true
  def handle_cast({:query, {:text, query}}, state) do
    state = send_stream_start(state)

    result =
      Buildel.VectorDB.query(state[:collection], query, %{
        api_key: state[:api_key],
        limit: state[:opts] |> Map.get(:limit, 3),
        similarity_threshhold: state[:opts] |> Map.get(:similarity_threshhold, 0.75)
      })
      |> Enum.map(fn
        %{
          "document" => document,
          "metadata" => %{"file_name" => filename, "memory_id" => memory_id}
        } ->
          %{
            document_id: memory_id,
            document_name: filename,
            chunk: document |> String.trim()
          }
      end)
      |> Jason.encode!()

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
  def handle_call({:query, {:text, query}}, _caller, state) do
    state = state |> send_stream_start()
    limit = state.opts |> Map.get(:limit, 3)
    similarity_threshhold = state.opts |> Map.get(:similarity_threshhold, 0.75)

    result =
      Buildel.VectorDB.query(state[:collection], query, %{
        api_key: state[:api_key],
        limit: limit,
        similarity_threshhold: similarity_threshhold
      })
      |> Enum.map(fn
        %{
          "document" => document,
          "metadata" => %{"file_name" => filename, "memory_id" => memory_id}
        } ->
          %{
            document_id: memory_id,
            document_name: filename,
            chunk: document |> String.trim()
          }
      end)
      |> Jason.encode!()

    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "output",
      {:text, result}
    )

    state = state |> schedule_stream_stop()

    {:reply, result, state}
  end

  @impl true
  def handle_call({:function, _}, _from, state) do
    pid = self()

    function =
      Function.new!(%{
        name: "query",
        description:
          "Search through documents and find text chunks related to the query. If you want to read the whole document a chunk comes from, use the `documents` function.",
        parameters_schema: %{
          type: "object",
          properties: %{
            query: %{
              type: "string",
              description: "The query to search for."
            }
          },
          required: ["query"]
        },
        function: fn %{"query" => query} = _args, _context ->
          query_sync(pid, {:text, query})
        end
      })

    {:reply,
     %{
       function: function,
       call_formatter: fn args ->
         "Database 📑: Search \"#{args["query"]}\"\n"
       end,
       response_formatter: fn _response ->
         ""
       end
     }, state}
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
