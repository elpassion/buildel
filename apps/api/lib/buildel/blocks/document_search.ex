defmodule Buildel.Blocks.DocumentSearch do
  alias Buildel.Blocks.Fields.EditorField
  alias Buildel.Memories.MemoryCollectionSearch
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
      inputs: [
        Block.file_input("input", false),
        Block.file_input("files", true),
        Block.text_input("query")
      ],
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
              "similarity_threshhold",
              "token_limit",
              "extend_neighbors",
              "extend_parents"
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
                token_limit: %{
                  "type" => "number",
                  "title" => "Token limit",
                  "description" =>
                    "The maximum number of tokens in result. Set to 0 for no limit.",
                  "default" => 0,
                  "minimum" => 0
                },
                similarity_threshhold: %{
                  "type" => "number",
                  "title" => "Similarity threshhold",
                  "description" => "The similarity threshhold to use for the search.",
                  "default" => 0.25,
                  "minimum" => 0.0,
                  "maximum" => 1.0,
                  "step" => 0.01
                },
                extend_neighbors: %{
                  "type" => "boolean",
                  "title" => "Extend neighbors",
                  "description" => "Extend the search to include neighbor chunks",
                  "default" => false
                },
                extend_parents: %{
                  "type" => "boolean",
                  "title" => "Extend parents",
                  "description" =>
                    "Extend the search to include the whole context of the parent chunk",
                  "default" => false
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

  def delete_file(pid, file_id) do
    GenServer.cast(pid, {:delete_file, file_id})
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
    token_limit = state.opts |> Map.get(:token_limit, 0)

    params =
      MemoryCollectionSearch.Params.from_map(%{
        search_query: query,
        where: state.where,
        limit: state[:opts] |> Map.get(:limit, 3),
        similarity_threshhold: state[:opts] |> Map.get(:similarity_threshhold, 0.25),
        extend_neighbors: state.opts |> Map.get(:extend_neighbors, false) != false,
        extend_parents: state.opts |> Map.get(:extend_parents, false) != false,
        token_limit:
          if token_limit == 0 do
            nil
          else
            token_limit
          end
      })

    %{collection_id: collection_id} =
      Buildel.Memories.context_from_organization_collection_name(state[:collection])

    {result, _total_tokens, embeddings_tokens} =
      MemoryCollectionSearch.new(%{
        vector_db: state.vector_db,
        organization_collection_name: state[:collection]
      })
      |> MemoryCollectionSearch.search(params)

    block_context().create_run_and_collection_cost(
      state[:context_id],
      state[:block_name],
      embeddings_tokens,
      collection_id
    )

    result =
      result
      |> Enum.map(fn
        %{
          "chunk_id" => chunk_id,
          "document" => document,
          "metadata" =>
            %{
              "file_name" => filename,
              "memory_id" => memory_id
            } = metadata
        } ->
          %{
            document_id: memory_id,
            document_name: filename,
            chunk_id: chunk_id,
            chunk: document |> String.trim(),
            pages: metadata |> Map.get("pages", [])
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

  def handle_cast({:add_file, {:binary, file_path, metadata}}, state) do
    state = send_stream_start(state)

    %{organization_id: organization_id, collection_id: collection_id} =
      Buildel.Memories.context_from_organization_collection_name(state[:collection])

    organization = Buildel.Organizations.get_organization!(organization_id)

    try do
      with {:ok, collection} <-
             Buildel.Memories.get_organization_collection(organization, collection_id),
           {:ok, _memory} <-
             Buildel.Memories.create_organization_memory(
               organization,
               collection,
               %{
                 path: file_path,
                 type: metadata |> Map.get(:file_type),
                 name: metadata |> Map.get(:file_name)
               },
               %{
                 file_uuid: metadata |> Map.get(:file_id)
               }
             ) do
        state = send_stream_stop(state)
        {:noreply, state}
      else
        {:error, _, message} ->
          send_error(state, message)

          state = state |> send_stream_stop()

          {:noreply, state}

        _ ->
          send_error(state, "Failed to add the file")

          state = state |> send_stream_stop()

          {:noreply, state}
      end
    rescue
      _ ->
        send_error(state, "Failed to add the file")

        state = state |> send_stream_stop()

        {:noreply, state}
    end
  end

  def handle_cast({:delete_file, file_id}, state) do
    state = send_stream_start(state)

    %{organization_id: organization_id, collection_id: collection_id} =
      Buildel.Memories.context_from_organization_collection_name(state[:collection])

    try do
      organization = Buildel.Organizations.get_organization!(organization_id)

      memory =
        Buildel.Memories.get_collection_memory_by_file_uuid!(organization, collection_id, file_id)

      {:ok, _} = Buildel.Memories.delete_organization_memory(organization, memory.id)

      state = send_stream_stop(state)
      {:noreply, state}
    rescue
      _ ->
        send_error(state, "Failed to delete the file")

        state = state |> send_stream_stop()

        {:noreply, state}
    end
  end

  @impl true
  def handle_call({:query, {:text, query}}, _caller, state) do
    state = state |> send_stream_start()
    limit = state.opts |> Map.get(:limit, 3)
    similarity_threshhold = state.opts |> Map.get(:similarity_threshhold, 0.25)
    token_limit = state.opts |> Map.get(:token_limit, 0)

    params =
      MemoryCollectionSearch.Params.from_map(%{
        search_query: query,
        where: state.where,
        limit: limit,
        similarity_threshhold: similarity_threshhold,
        extend_neighbors: state.opts |> Map.get(:extend_neighbors, false) != false,
        extend_parents: state.opts |> Map.get(:extend_parents, false) != false,
        token_limit:
          if token_limit == 0 do
            nil
          else
            token_limit
          end
      })

    %{collection_id: collection_id} =
      Buildel.Memories.context_from_organization_collection_name(state[:collection])

    case MemoryCollectionSearch.new(%{
           vector_db: state.vector_db,
           organization_collection_name: state[:collection]
         })
         |> MemoryCollectionSearch.search(params) do
      {result, _total_tokens, embeddings_tokens} when is_list(result) ->
        result =
          result
          |> Enum.map(fn
            %{
              "chunk_id" => chunk_id,
              "document" => document,
              "metadata" =>
                %{
                  "file_name" => filename,
                  "memory_id" => memory_id
                } = metadata
            } ->
              %{
                document_id: memory_id,
                document_name: filename,
                chunk_id: chunk_id,
                chunk: document |> String.trim(),
                pages: metadata |> Map.get("pages", [])
              }
          end)
          |> Jason.encode!()

        block_context().create_run_and_collection_cost(
          state[:context_id],
          state[:block_name],
          embeddings_tokens,
          collection_id
        )

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

      {:error, :insufficient_quota} ->
        send_error(state, "Insufficient quota for querying documents.")

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
  def handle_input("input", {_name, :binary, binary, metadata}, state) do
    add_file(self(), {:binary, binary, metadata})
    state
  end

  def handle_input("input", {_name, :text, file_id, %{method: :delete}}, state) do
    delete_file(self(), file_id)
    state
  end

  def handle_input("query", {_name, :text, text, _metadata}, state) do
    query(self(), {:text, text})
    state
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
