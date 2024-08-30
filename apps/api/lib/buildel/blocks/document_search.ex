defmodule Buildel.Blocks.DocumentSearch do
  alias Buildel.Blocks.Fields.EditorField
  alias Buildel.Memories.MemoryCollectionSearch
  alias Buildel.Blocks.DocumentSearch.DocumentSearchJSON
  use Buildel.Blocks.Block
  use Buildel.Blocks.Tool

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
      dynamic_ios: nil,
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
                    "readonly" => true,
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
                    display_when: %{
                      connections: %{
                        tool_worker: %{
                          min: 1
                        }
                      }
                    },
                    minLength: 1
                  }),
                keywords: %{
                  "type" => "string",
                  "title" => "Memory keywords",
                  "description" =>
                    "Filter the search to a specific keywords. Ex. [\"keyword1\", \"keyword2\"]"
                },
                memory_id: %{
                  "type" => "string",
                  "title" => "Memory file",
                  "description" => "Filter the search to search in a specific document.",
                  "url" =>
                    "/api/organizations/{{organization_id}}/memory_collections/{{opts.knowledge}}/memories",
                  "presentAs" => "async-select",
                  "readonly" => true
                }
              )
          })
      }
    }
  end

  # Client

  def query(pid, {:text, _text} = text, metadata \\ %{}) do
    GenServer.cast(pid, {:query, text, metadata})
  end

  def parent(pid, {:text, _text} = text, metadata \\ %{}) do
    GenServer.cast(pid, {:parent, text, metadata})
  end

  def related(pid, {:text, _text} = text, metadata \\ %{}) do
    GenServer.cast(pid, {:related, text, metadata})
  end

  def add_file(pid, file) do
    GenServer.cast(pid, {:add_file, file})
  end

  def delete_file(pid, file_id) do
    GenServer.cast(pid, {:delete_file, file_id})
  end

  # Server

  @impl true
  def setup(
        %{
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        } = state
      ) do
    {:ok, vector_db} = block_context().get_vector_db(context_id, opts.knowledge)

    {:ok, collection, collection_name} =
      block_context().get_global_collection(context_id, opts.knowledge)

    {:ok,
     state
     |> Map.put(:vector_db, vector_db)
     |> Map.put(:collection, collection)
     |> Map.put(:collection_name, collection_name)
     |> Map.put(:where, %{
       "memory_id" =>
         case opts.memory_id do
           nil -> nil
           "" -> nil
           memory_id -> String.to_integer(memory_id)
         end,
       "keywords" =>
         case opts.keywords do
           nil -> nil
           "" -> nil
           keywords -> Jason.decode!(keywords)
         end
     })
     |> Map.put(
       :call_formatter,
       opts |> Map.get(:call_formatter, "Database 📑: Search \"{{config.args}}\"\n")
     )}
  end

  @impl true
  def handle_cast({:query, {:text, query}, _metadata}, state) do
    state = send_stream_start(state)
    result = do_query(state, query)
    state = output(state, "output", {:text, result})
    {:noreply, state}
  end

  def handle_cast({:parent, {:text, chunk_id}, _metadata}, state) do
    state = send_stream_start(state)
    result = do_parent(state, chunk_id)
    state = output(state, "output", {:text, result})
    {:noreply, state}
  end

  def handle_cast({:related, {:text, chunk_id}, _metadata}, state) do
    result = do_related(state, chunk_id)

    state =
      state
      |> output("output", {:text, result})

    {:noreply, state}
  end

  def handle_cast({:add_file, {:binary, file_path, metadata}}, state) do
    state = send_stream_start(state)

    try do
      with {:ok, memory} <-
             block_context().create_memory(
               state.context_id,
               state.collection,
               %{
                 path: file_path,
                 type: metadata |> Map.get(:file_type),
                 name: metadata |> Map.get(:file_name)
               },
               %{
                 file_uuid: metadata |> Map.get(:file_id)
               }
             ) do
        state =
          state
          |> output("output", {:text, memory.content})
          |> send_stream_stop(state)

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

    try do
      {:ok, _} = block_context().delete_file(state.context_id, state.collection, file_id)

      state = send_stream_stop(state)
      {:noreply, state}
    rescue
      _ ->
        send_error(state, "Failed to delete the file")

        state = state |> send_stream_stop()

        {:noreply, state}
    end
  end

  defp do_query(state, query, tool_filters \\ %{}) do
    token_limit = state.opts |> Map.get(:token_limit, 0)

    params =
      MemoryCollectionSearch.Params.from_map(%{
        search_query: query,
        where:
          Map.merge(tool_filters, state.where, fn _key, bot_value, set_value ->
            if set_value, do: set_value, else: bot_value
          end),
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

    {result, _total_tokens, embeddings_tokens} =
      MemoryCollectionSearch.new(%{
        vector_db: state.vector_db,
        organization_collection_name: state.collection_name
      })
      |> MemoryCollectionSearch.search(params)

    block_context().create_run_and_collection_cost(
      state[:context_id],
      state[:block_name],
      embeddings_tokens,
      state.collection.id
    )

    result
    |> Enum.map(&DocumentSearchJSON.show/1)
    |> Jason.encode!()
  end

  defp do_parent(state, chunk_id) do
    MemoryCollectionSearch.new(%{
      vector_db: state.vector_db,
      organization_collection_name: state.collection_name
    })
    |> MemoryCollectionSearch.parent(chunk_id)
    |> then(&DocumentSearchJSON.show/1)
    |> Jason.encode!()
  end

  defp do_related(state, chunk_id) do
    chunk = Buildel.VectorDB.get_by_id(state.vector_db, state.collection_name, chunk_id)

    params =
      MemoryCollectionSearch.Params.from_map(%{
        search_query: Map.get(chunk, "embedding"),
        where: state.where,
        limit: 2,
        similarity_threshhold: state[:opts] |> Map.get(:similarity_threshhold, 0.25),
        extend_neighbors: false,
        extend_parents: false,
        token_limit: nil
      })

    {result, _total_tokens, _embeddings_tokens} =
      MemoryCollectionSearch.new(%{
        vector_db: state.vector_db,
        organization_collection_name: state.collection_name
      })
      |> MemoryCollectionSearch.search(params)

    result
    |> Enum.at(1)
    |> then(&DocumentSearchJSON.show/1)
    |> Jason.encode!()
  end

  @impl true
  def tools(state) do
    [
      %{
        function: %{
          name: "query",
          description:
            "Search through documents and find text chunks related to the query. If you want to read the whole document a chunk comes from, use the `documents` function.
            CALL IT WITH FORMAT `{ \"query\": \"example query\" }`
            You can also use filters to narrow down the search results. Filters are optional. Apply filters based on the metadata of the documents from previous queries.",
          parameters_schema: %{
            type: "object",
            properties: %{
              query: %{
                type: "string",
                description: "The query to search for."
              },
              filters: %{
                type: "object",
                description: "The filters to apply to the search.",
                properties: %{
                  memory_id: %{
                    type: "number",
                    description: "The ID of a document to search in."
                  },
                  keywords: %{
                    type: "array",
                    items: %{
                      type: "string"
                    },
                    description: "The keywords to search for."
                  }
                }
              }
            },
            required: ["query"]
          }
        },
        call_formatter: fn args ->
          args = %{"config.args" => args, "config.block_name" => state.block.name}
          build_call_formatter(state.call_formatter, args)
        end,
        response_formatter: fn _response ->
          ""
        end
      },
      %{
        function: %{
          name: "parent",
          description: "Retrieve the parent context of a specified chunk",
          parameters_schema: %{
            type: "object",
            properties: %{
              chunk_id: %{
                type: "string",
                description: "chunk_id"
              }
            },
            required: ["chunk_id"]
          }
        },
        call_formatter: fn args ->
          args = %{"config.args" => args, "config.block_name" => state.block.name}
          build_call_formatter(state.call_formatter, args)
        end,
        response_formatter: fn _response ->
          ""
        end
      },
      %{
        function: %{
          name: "related",
          description: "Retrieve the related context of a specified chunk",
          parameters_schema: %{
            type: "object",
            properties: %{
              chunk_id: %{
                type: "string",
                description: "chunk_id"
              }
            },
            required: ["chunk_id"]
          }
        },
        call_formatter: fn args ->
          args = %{"config.args" => args, "config.block_name" => state.block.name}
          build_call_formatter(state.call_formatter, args)
        end,
        response_formatter: fn _response ->
          ""
        end
      }
    ]
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

  @impl true
  def handle_tool("tool", "query", {_name, :text, args, _metadata}, state) do
    state |> send_stream_start("output")
    response = do_query(state, args["query"], args["filters"] || %{})
    state = output(state, "output", {:text, response})
    {response, state}
  end

  def handle_tool("tool", "parent", {_name, :text, args, _metadata}, state) do
    state = state |> send_stream_start("output")
    response = do_parent(state, args["chunk_id"])
    state = output(state, "output", {:text, response})
    {response, state}
  end

  def handle_tool("tool", "related", {_name, :text, args, _metadata}, state) do
    state = state |> send_stream_start("output")
    response = do_related(state, args["chunk_id"])
    state = output(state, "output", {:text, response})
    {response, state}
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

defmodule Buildel.Blocks.DocumentSearch.DocumentSearchJSON do
  def show(%{
        "chunk_id" => chunk_id,
        "document" => document,
        "metadata" =>
          %{
            "file_name" => filename,
            "memory_id" => memory_id
          } = metadata
      }) do
    %{
      document_id: memory_id,
      document_name: filename,
      chunk_id: chunk_id,
      chunk: document |> String.trim(),
      pages: metadata |> Map.get("pages", []),
      keywords: metadata |> Map.get("keywords", [])
    }
  end
end
