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

  def function(context_id, block_name) do
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
        pid = block_context().block_pid(context_id, block_name)

        query_sync(pid, {:text, query})
      end
    })
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
  def init(
        [
          name: _name,
          block_name: _block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, opts.inputs)

    api_key =
      block_secrets_resolver().get_secret_from_context(context_id, opts |> Map.get(:api_key))

    %{global: global} =
      block_context().context_from_context_id(context_id)

    collection_name = "#{global}_#{opts[:knowledge]}"

    {:ok,
     state
     |> Keyword.put(:api_key, api_key)
     |> Keyword.put(:collection, collection_name)
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
  def handle_info({_name, :text, text}, state) do
    cast(self(), {:text, text})
    {:noreply, state}
  end

  defp block_context() do
    Application.fetch_env!(:buildel, :block_context_resolver)
  end
end
