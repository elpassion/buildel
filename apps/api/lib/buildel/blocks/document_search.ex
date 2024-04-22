defmodule Buildel.Blocks.DocumentSearch do
  alias Buildel.Blocks.Fields.EditorField
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
              "knowledge",
              "limit",
              "similarity_threshhold"
            ],
            "properties" =>
              Jason.OrderedObject.new(
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
                },
                call_formatter:
                  EditorField.call_formatter(%{
                    default: "Database 📑: Search \"{{config.args}}\"\n",
                    minLength: 1
                  }),
                where:
                  EditorField.new(%{
                    title: "Metadata",
                    description: "The metadata of documents to include in retrieval.",
                    default: "{}",
                    editor_language: "json"
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

  def add_file(pid, file) do
    GenServer.cast(pid, {:add_file, file})
  end

  # Server

  @impl true
  def init(
        %{
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        } = state
      ) do
    subscribe_to_connections(context_id, state.connections)

    {:ok, vector_db} = block_context().get_vector_db(context_id, opts.knowledge)

    {:ok, collection} =
      block_context().get_global_collection_name(context_id, opts.knowledge)

    {:ok,
     state
     |> assign_stream_state()
     |> Map.put(:vector_db, vector_db)
     |> Map.put(:collection, collection)
     |> Map.put(:where, opts |> Map.get(:where, "{}") |> Jason.decode!())
     |> Map.put(
       :call_formatter,
       opts |> Map.get(:call_formatter, "Database 📑: Search \"{{config.args}}\"\n")
     )}
  end

  @impl true
  def handle_cast({:query, {:text, query}}, state) do
    state = send_stream_start(state)

    result =
      Buildel.VectorDB.query(state.vector_db, state[:collection], query, state.where, %{
        limit: state[:opts] |> Map.get(:limit, 3),
        similarity_threshhold: state[:opts] |> Map.get(:similarity_threshhold, 0.75)
      })
      |> Enum.map(fn
        %{
          "chunk_id" => chunk_id,
          "document" => document,
          "metadata" => %{
            "file_name" => filename,
            "memory_id" => memory_id
          }
        } ->
          %{
            document_id: memory_id,
            document_name: filename,
            chunk_id: chunk_id,
            chunk: document |> String.trim()
          }
      end)
      |> Jason.encode!()

    IO.inspect(result)

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

    Buildel.VectorDB.add(state.vector_db, state[:collection], documents)
    state = send_stream_stop(state)
    {:noreply, state}
  end

  @impl true
  def handle_call({:query, {:text, query}}, _caller, state) do
    state = state |> send_stream_start()
    limit = state.opts |> Map.get(:limit, 3)
    similarity_threshhold = state.opts |> Map.get(:similarity_threshhold, 0.75)

    case Buildel.VectorDB.query(state.vector_db, state[:collection], query, state.where, %{
           limit: limit,
           similarity_threshhold: similarity_threshhold
         }) do
      result when is_list(result) ->
        result =
          result
          |> Enum.map(fn
            %{
              "document" => document,
              "metadata" => %{
                "file_name" => filename,
                "memory_id" => memory_id,
                "chunk_id" => chunk_id
              }
            } ->
              %{
                document_id: memory_id,
                document_name: filename,
                chunk_id: chunk_id,
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

      {:error, :invalid_api_key} ->
        send_error(state, "Invalid API key used for querying documents.")

        state = state |> schedule_stream_stop()

        {:reply, "Unable to query the database.", state}
    end
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
         args = %{"config.args" => args, "config.block_name" => state.block.name}
         build_call_formatter(state.call_formatter, args)
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

  defp build_call_formatter(value, args) do
    args
    |> Enum.reduce(value, fn
      {key, value}, acc when is_number(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_binary(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_map(value) ->
        String.replace(acc, "{{#{key}}}", Jason.encode!(value))

      _, acc ->
        acc
    end)
  end
end
