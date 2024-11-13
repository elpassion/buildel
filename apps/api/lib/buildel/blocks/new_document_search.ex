defmodule Buildel.Blocks.NewDocumentSearch do
  alias Buildel.Blocks.Fields.EditorField
  alias Buildel.Memories.MemoryCollectionSearch
  alias Buildel.Blocks.DocumentSearch.DocumentSearchJSON
  use Buildel.Blocks.NewBlock

  import Buildel.Blocks.Utils.Schemas

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :query


  defblock(:document_search,
    description:
    "Used for efficient searching and retrieval of information from a collection of documents inside Buildel Knowledge Base.",
    groups: ["file", "memory"]
  )

  definput(:input, schema: %{"type" => "object"}, type: :file, public: false)
  definput(:files, schema: %{"type" => "object"}, type: :file, public: true)
  definput(:query, schema: %{}, public: false)

  defoutput(:output, schema: %{})


  defoption(
    :knowledge,
    memory_schema(%{
      "readonly" => true,
      "title" => "Knowledge",
      "description" => "The knowledge to use for retrieval.",
      "default" => ""
    })
  )

  defoption(
    :limit,
    %{
      "readonly" => true,
      "type" => "number",
      "title" => "Limit",
      "description" => "The maximum number of results to return.",
      "default" => 3
    }
  )

  defoption(
    :token_limit,
    %{
      "type" => "number",
      "title" => "Token limit",
      "description" =>
        "The maximum number of tokens in result. Set to 0 for no limit.",
      "default" => 0,
      "minimum" => 0
    }
  )

  defoption(
    :similarity_threshhold,
    %{
      "type" => "number",
      "title" => "Similarity threshhold",
      "description" => "The similarity threshhold to use for the search.",
      "default" => 0.25,
      "minimum" => 0.0,
      "maximum" => 1.0,
      "step" => 0.01
    }
  )

  defoption(
    :extend_neighbors,
    %{
      "readonly" => true,
      "type" => "boolean",
      "title" => "Extend neighbors",
      "description" => "Extend the search to include neighbor chunks",
      "default" => false
    }
  )

  defoption(
    :extend_parents,
    %{
      "readonly" => true,
      "type" => "boolean",
      "title" => "Extend parents",
      "description" =>
        "Extend the search to include the whole context of the parent chunk",
      "default" => false
    }
  )

  defoption(
    :extend_parents,
    %{
      "readonly" => true,
      "type" => "boolean",
      "title" => "Extend parents",
      "description" =>
        "Extend the search to include the whole context of the parent chunk",
      "default" => false
    }
  )

  defoption(
    :keywords,
    %{
      "type" => "string",
      "title" => "Memory keywords",
      "description" =>
        "Filter the search to a specific keywords. Ex. [\"keyword1\", \"keyword2\"]"
    }
  )

  defoption(
    :document_id,
    %{
      "type" => "string",
      "title" => "Memory file",
      "description" => "Filter the search to search in a specific document.",
      "url" =>
        "/api/organizations/{{organization_id}}/memory_collections/{{opts.knowledge}}/memories",
      "presentAs" => "async-select",
      "readonly" => true
    }
  )

  deftool(:query,
    description:
      "Search through documents and find text chunks related to the query. If you want to read the whole document a chunk comes from, use the `documents` function.
            CALL IT WITH FORMAT `{ \"message\": \"example query\" }`
            You can also use filters to narrow down the search results. Filters are optional. Apply filters based on the metadata of the documents from previous queries.
            You can use `document_id` property to narrow the search to the specific document.
            DO NOT SET MORE THAN 2 KEYWORDS",
    schema: %{
      "type" => "object",
      "properties" => %{
        "message" => %{
          "type" => "string",
          "description" => "The query to search for."
        },
        "filters" => %{
          "type" => "object",
          "description" => "The filters to apply to the search.",
          "properties" => %{
            "memory_id" => %{
              "type" => "number",
              "description" => "The ID of a document to search in."
            }
            # keywords: %{
            #   type: "array",
            #   items: %{
            #     type: "string"
            #   },
            #   description: "The keywords to search for. Max 2 keywords"
            # }
          }
        }

      },
      "required" => ["message"]
    }
  )

  deftool(:parent,
    description:
      "Retrieve the parent context of a specified chunk",
    schema: %{
      type: "object",
      properties: %{
        chunk_id: %{
          type: "string",
          description: "chunk_id"
        }
      },
      required: ["chunk_id"]
    }
  )

  deftool(:related,
    description:
      "Retrieve the related context of a specified chunk",
    schema: %{
      type: "object",
      properties: %{
        chunk_id: %{
          type: "string",
          description: "chunk_id"
        }
      },
      required: ["chunk_id"]
    }
  )

#  def query(pid, {:text, _text} = text, metadata \\ %{}) do
#    GenServer.cast(pid, {:query, text, metadata})
#  end
#
#  def parent(pid, {:text, _text} = text, metadata \\ %{}) do
#    GenServer.cast(pid, {:parent, text, metadata})
#  end
#
#  def related(pid, {:text, _text} = text, metadata \\ %{}) do
#    GenServer.cast(pid, {:related, text, metadata})
#  end
#
#  def add_file(pid, file) do
#    GenServer.cast(pid, {:add_file, file})
#  end
#
#  def delete_file(pid, file_id) do
#    GenServer.cast(pid, {:delete_file, file_id})
#  end

#  # Server
#
#  def setup(
#        %{
#          context_id: context_id,
#          type: __MODULE__,
#          opts: opts
#        } = state
#      ) do
#    {:ok, vector_db} = get_vector_db(state.context.context_id, opts.knowledge)
#
#    {:ok, collection, collection_name} =
#      get_global_collection(state.context.context_id, opts.knowledge)
#
#    {:ok,
#     state
#     |> Map.put(:vector_db, vector_db)
#     |> Map.put(:collection, collection)
#     |> Map.put(:collection_name, collection_name)
#     |> Map.put(:where, %{
#       "memory_id" =>
#         case opts[:document_id] do
#           nil -> nil
#           "" -> nil
#           memory_id -> String.to_integer(memory_id)
#         end,
#       "keywords" =>
#         case opts[:keywords] do
#           nil -> nil
#           "" -> nil
#           keywords -> Jason.decode!(keywords)
#         end
#     })
#     |> Map.put(
#       :call_formatter,
#       opts |> Map.get(:call_formatter, "Database 📑: Search \"{{config.args}}\"\n")
#     )}
#  end


  def handle_input(:query, %Message{type: :text, message: message_query} = message, state) do
    IO.inspect(message, label: "AWW")
    send_stream_start(state, :output, message)

    result = do_query(state, message_query)

    output(state, :output, message |> Message.set_message(result))
    {:ok, state}
  end
#
#  def handle_cast({:parent, {:text, chunk_id}, _metadata}, state) do
#    state = send_stream_start(state)
#    result = do_parent(state, chunk_id)
#    state = output(state, "output", {:text, result})
#    {:noreply, state}
#  end
#
#  def handle_cast({:related, {:text, chunk_id}, _metadata}, state) do
#    result = do_related(state, chunk_id)
#
#    state =
#      state
#      |> output("output", {:text, result})
#
#    {:noreply, state}
#  end

#  def handle_cast({:add_file, {:binary, file_path, metadata}}, state) do
#    state = send_stream_start(state)
#
#    try do
#      with {:ok, memory} <-
#             block_context().create_memory(
#               state.context_id,
#               state.collection,
#               %{
#                 path: file_path,
#                 type: metadata |> Map.get(:file_type),
#                 name: metadata |> Map.get(:file_name)
#               },
#               %{
#                 file_uuid: metadata |> Map.get(:file_id)
#               }
#             ) do
#        state =
#          state
#          |> output("output", {:text, memory.content})
#          |> send_stream_stop(state)
#
#        {:noreply, state}
#      else
#        {:error, _, message} ->
#          send_error(state, message)
#
#          state = state |> send_stream_stop()
#
#          {:noreply, state}
#
#        _ ->
#          send_error(state, "Failed to add the file")
#
#          state = state |> send_stream_stop()
#
#          {:noreply, state}
#      end
#    rescue
#      _ ->
#        send_error(state, "Failed to add the file")
#
#        state = state |> send_stream_stop()
#
#        {:noreply, state}
#    end
#  end
#
#  def handle_cast({:delete_file, file_id}, state) do
#    state = send_stream_start(state)
#
#    try do
#      {:ok, _} = block_context().delete_file(state.context_id, state.collection, file_id)
#
#      state = send_stream_stop(state)
#      {:noreply, state}
#    rescue
#      _ ->
#        send_error(state, "Failed to delete the file")
#
#        state = state |> send_stream_stop()
#
#        {:noreply, state}
#    end
#  end

  defp do_query(state, query, tool_filters \\ %{}) do
    token_limit = option(state, :token_limit)

    params =
      MemoryCollectionSearch.Params.from_map(%{
        search_query: query,
        where:
          Map.merge(tool_filters, with_where(state), fn _key, bot_value, set_value ->
            if set_value, do: set_value, else: bot_value
          end),
        limit: option(state, :limit),
        similarity_threshhold:  option(state, :similarity_threshhold),
        extend_neighbors: option(state, :extend_neighbors) != false,
        extend_parents: option(state, :extend_parents) != false,
        token_limit:
          if token_limit == 0 do
            nil
          else
            token_limit
          end
      })

    {:ok, collection, collection_name} =
      get_global_collection(state.context.context_id, option(state, :knowledge))

    {:ok, vector_db} = get_vector_db(state.context.context_id, option(state, :knowledge))

    {result, _total_tokens, embeddings_tokens} =
      MemoryCollectionSearch.new(%{
        vector_db: vector_db,
        organization_collection_name: collection_name
      })
      |> MemoryCollectionSearch.search(params)

    create_run_and_collection_cost(
      state.context.context_id,
      state[:block_name],
      embeddings_tokens,
      collection.id
    )

    result
    |> Enum.map(&DocumentSearchJSON.show(&1))
    |> Jason.encode!()
  rescue
    _ -> "Could not return record"
  end

#  defp do_parent(state, chunk_id) do
#
#    {:ok, collection, collection_name} =
#      get_global_collection(state.context.context_id, option(state, :knowledge))
#
#    {:ok, vector_db} = get_vector_db(state.context.context_id, option(state, :knowledge))
#
#
#    MemoryCollectionSearch.new(%{
#      vector_db: vector_db,
#      organization_collection_name: collection_name
#    })
#    |> MemoryCollectionSearch.parent(chunk_id)
#    |> then(&DocumentSearchJSON.show(&1))
#    |> Jason.encode!()
#  end
#
#  defp do_related(state, chunk_id) do
#    {:ok, collection, collection_name} =
#      get_global_collection(state.context.context_id, option(state, :knowledge))
#
#    {:ok, vector_db} = get_vector_db(state.context.context_id, option(state, :knowledge))
#
#    chunk = Buildel.VectorDB.get_by_id(vector_db, collection_name, chunk_id)
#
#    params =
#      MemoryCollectionSearch.Params.from_map(%{
#        search_query: Map.get(chunk, "embedding"),
#        where:  with_where(state),
#        limit: 2,
#        similarity_threshhold: option(state, :similarity_threshhold),
#        extend_neighbors: false,
#        extend_parents: false,
#        token_limit: nil
#      })
#
#    {result, _total_tokens, _embeddings_tokens} =
#      MemoryCollectionSearch.new(%{
#        vector_db: vector_db,
#        organization_collection_name: collection_name
#      })
#      |> MemoryCollectionSearch.search(params)
#
#    result
#    |> Enum.at(1)
#    |> then(&DocumentSearchJSON.show(&1))
#    |> Jason.encode!()
#  end



#  @impl true
#  def handle_input("input", {_name, :binary, binary, metadata}, state) do
#    add_file(self(), {:binary, binary, metadata})
#    state
#  end
#
#  def handle_input("input", {_name, :text, file_id, %{method: :delete}}, state) do
#    delete_file(self(), file_id)
#    state
#  end
#
#  def handle_input("query", {_name, :text, text, _metadata}, state) do
#    query(self(), {:text, text})
#    state
#  end

  def handle_get_tool(:query, state) do
    tool = @tools |> Enum.find(&(&1.name == :query))
  end

  def handle_get_tool(:related, state) do
    tool = @tools |> Enum.find(&(&1.name == :related))
  end

  def handle_get_tool(:parent, state) do
    tool = @tools |> Enum.find(&(&1.name == :parent))
  end

  def handle_tool_call(:query, %Message{message: %{args: args}} = message, state) do
    send_stream_start(state, :output, message)

    result = do_query(state, args["message"])

    message =  message |> Message.set_message(result) |> Message.set_type(:text)

    output(state, :output, message)

    {:ok, message, state}
  end

  def handle_tool_call(:parent, %Message{message: %{args: args}} = message, state) do
    IO.inspect("PARENT")
#    send_stream_start(state, :output, message)
#
#    result = do_query(state, args["message"])
#
#    output(state, :output, message |> Message.set_message(result) |> Message.set_type(:text))
#
#    {:ok, message |> Message.set_message(result) |> Message.set_type(:tool_response), state}
  end

  def handle_tool_call(:related, %Message{message: %{args: args}} = message, state) do
    IO.inspect("RELATED")
#    send_stream_start(state, :output, message)
#
#    result = do_query(state, args["message"])
#
#    output(state, :output, message |> Message.set_message(result) |> Message.set_type(:text))
#
#    {:ok, message |> Message.set_message(result) |> Message.set_type(:tool_response), state}
  end

#  @impl true
#  def handle_tool("tool", "query", {_name, :text, args, _metadata}, state) do
#    state |> send_stream_start("output")
#    response = do_query(state, args["query"], args["filters"] || %{})
#    state = output(state, "output", {:text, response})
#    {response, state}
#  end
#
#  def handle_tool("tool", "parent", {_name, :text, args, _metadata}, state) do
#    IO.inspect(args, label: "args")
##    state = state |> send_stream_start("output")
#    response = do_parent(state, args["chunk_id"])
##    state = output(state, "output", {:text, response})
#    {response, state}
#  end
##
#  def handle_tool("tool", "related", {_name, :text, args, _metadata}, state) do
#    state = state |> send_stream_start("output")
#    response = do_related(state, args["chunk_id"])
#    state = output(state, "output", {:text, response})
#    {response, state}
#  end

#  defp build_call_formatter(value, args) do
#    args
#    |> Enum.reduce(value, fn
#      {key, value}, acc when is_number(value) ->
#        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())
#
#      {key, value}, acc when is_binary(value) ->
#        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())
#
#      {key, value}, acc when is_map(value) ->
#        String.replace(acc, "{{#{key}}}", Jason.encode!(value))
#
#      _, acc ->
#        acc
#    end)
#  end

  ## --- Added ---

  defp with_where(state) do
     %{
      "memory_id" =>
        case option(state, :document_id) do
          nil -> nil
          "" -> nil
          memory_id -> String.to_integer(memory_id)
        end,
      "keywords" =>
        case option(state, :keywords) do
          nil -> nil
          "" -> nil
          keywords -> Jason.decode!(keywords)
        end
    }
  end

  ## -------

  ## -- Copied --
  defp get_vector_db(context_id, collection_name) do
    %{global: organization_id} = context_from_context_id(context_id)
    organization = Buildel.Organizations.get_organization!(organization_id)

    {:ok, collection} =
      Buildel.Memories.get_organization_collection(organization, collection_name)

    api_key = get_secret_from_context(context_from_context_id(context_id), collection.embeddings_secret_name)

    vector_db =
      Buildel.VectorDB.new(%{
        adapter: Buildel.VectorDB.EctoAdapter,
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: collection.embeddings_api_type,
            model: collection.embeddings_model,
            api_key: api_key,
            endpoint: collection.embeddings_endpoint
          })
      })

    {:ok, vector_db}
  end

  defp get_secret_from_context(%{global: organization_id}, secret_name) do
    with %Buildel.Organizations.Organization{} = organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, secret} <- Buildel.Organizations.get_organization_secret(organization, secret_name) do
      secret.value
    else
      err -> nil
    end
  end

  defp get_dataset_from_context(context_id, dataset_id) do
    with %{global: organization_id} = context_from_context_id(context_id),
         %Buildel.Organizations.Organization{} = organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, dataset} <- Buildel.Datasets.get_organization_dataset(organization, dataset_id) do
      dataset
    else
      _ -> nil
    end
  end

  defp get_global_collection(context_id, collection_name) do
    %{global: organization_id} = context_from_context_id(context_id)
    organization = Buildel.Organizations.get_organization!(organization_id)

    {:ok, collection} =
      Buildel.Memories.get_organization_collection(organization, collection_name)

    {:ok, collection, Buildel.Memories.organization_collection_name(organization, collection)}
  end

  defp context_from_context_id(context_id) do
    ["organizations", organization_id, "pipelines", pipeline_id, "runs", run_id] =
      String.split(context_id, ":")

    %{
      global: organization_id,
      parent: pipeline_id,
      local: run_id
    }
  end

  defp create_run_and_collection_cost(context_id, block_name, tokens, collection_id) do
    %{global: organization_id, parent: pipeline_id, local: run_id} =
      context_from_context_id(context_id)

    with organization <-
           Buildel.Organizations.get_organization!(organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, collection_id),
         cost_amount <-
           Buildel.Costs.CostCalculator.calculate_embeddings_cost(
             %Buildel.Langchain.EmbeddingsTokenSummary{
               tokens: tokens,
               model: collection.embeddings_model,
               endpoint: collection.embeddings_endpoint
             }
           ),
         {:ok, pipeline} <-
           Buildel.Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Buildel.Pipelines.get_pipeline_run(pipeline, run_id),
         {:ok, cost} <-
           Buildel.Organizations.create_organization_cost(organization, %{
             amount: cost_amount,
             input_tokens: tokens,
             output_tokens: 0
           }),
         {:ok, run_cost} <-
           Buildel.Pipelines.create_run_cost(run, cost, %{
             description: block_name
           }),
         {:ok, collection_cost} <-
           Buildel.Memories.create_memory_collection_cost(collection, cost, %{
             cost_type: :query,
             description: "document_search"
           }) do
      {:ok, run_cost, collection_cost}
    else
      _ ->
        {:error, :not_found}
    end
  end

  ## ----
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
    {:ok, chunk_temporary_uuid} =
      Buildel.MemoriesAccess.add_chunk(%{
        chunk_id: chunk_id,
        memory_id: memory_id
      })

    %{
      document_id: memory_id,
      document_name: filename,
      url:
        Application.get_env(:buildel, :page_url) <>
          "/knowledge-base/memories/chunks/#{chunk_temporary_uuid}",
      chunk_id: chunk_id,
      chunk: document |> String.trim(),
      pages: metadata |> Map.get("pages", []),
      keywords: metadata |> Map.get("keywords", [])
    }
  end
end
