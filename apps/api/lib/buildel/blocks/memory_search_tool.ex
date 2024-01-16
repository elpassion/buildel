defmodule Buildel.Blocks.MemorySearchTool do
  use Buildel.Blocks.Block
  alias LangChain.Function

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :query

  @impl true
  def options() do
    %{
      type: "memory_search_tool",
      groups: ["text", "tools"],
      inputs: [],
      outputs: [],
      ios: [Block.io("tool", "worker")],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["api_key", "knowledge"],
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
                  })
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

  # Server

  @impl true
  def init(%{context_id: context_id, type: __MODULE__, opts: opts} = state) do
    subscribe_to_connections(context_id, state.connections)

    api_key =
      block_secrets_resolver().get_secret_from_context(context_id, opts |> Map.get(:api_key))

    collection_name = block_context().global_collection_name(context_id, opts.knowledge)

    {:ok,
     state
     |> Map.put(:api_key, api_key)
     |> Map.put(:collection, collection_name)
     |> assign_stream_state(opts)}
  end

  @impl true
  def handle_cast({:query, {:text, query}}, state) do
    state = state |> send_stream_start()

    Buildel.VectorDB.query(state[:collection], query, api_key: state[:api_key])
    |> Enum.take(3)
    |> Enum.map(fn %{
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

    state = state |> schedule_stream_stop()

    {:noreply, state}
  end

  @impl true
  def handle_call({:query, {:text, query}}, _caller, state) do
    state = state |> send_stream_start()

    result =
      Buildel.VectorDB.query(state[:collection], query, api_key: state[:api_key])
      |> Enum.take(3)
      |> Enum.map(fn %{
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

    state = state |> schedule_stream_stop()

    {:reply, result, state}
  end

  @impl true
  def handle_call(:function, _from, state) do
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

    {:reply, function, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    cast(self(), {:text, text})
    {:noreply, state}
  end
end
