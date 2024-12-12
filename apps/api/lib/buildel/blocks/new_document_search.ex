defmodule Buildel.Blocks.NewDocumentSearch do
  alias Buildel.Memories.MemoryCollectionSearch
  alias Buildel.Blocks.DocumentSearch.DocumentSearchJSON
  alias Buildel.Clients.Utils.Context
  use Buildel.Blocks.NewBlock.Memory
  use Buildel.Blocks.NewBlock

  import Buildel.Blocks.Utils.Schemas

  defblock(:document_search,
    description:
      "Used for efficient searching and retrieval of information from a collection of documents inside Buildel Knowledge Base.",
    groups: ["tool", "file", "memory"]
  )

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
      "description" => "The maximum number of tokens in result. Set to 0 for no limit.",
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
      "description" => "Extend the search to include the whole context of the parent chunk",
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
          }
        }
      },
      "required" => ["message"]
    }
  )

  deftool(:parent,
    description: "Retrieve the parent context of a specified chunk",
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
    description: "Retrieve the related context of a specified chunk",
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

  def handle_input(:query, %Message{type: :text, message: message_query} = message, state) do
    send_stream_start(state, :output, message)

    response = message |> Message.from_message()

    with {:ok, result} <- do_query(state, message_query) do
      response = response |> Message.set_message(result)

      output(state, :output, response)
      {:ok, state}
    else
      {:error, reason, state} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(reason)
        )

        send_stream_stop(state, :output, message)

        {:error, reason, state}
    end
  end

  def handle_tool_call(:query, %Message{message: %{args: args}} = message, state) do
    send_stream_start(state, :output, message)

    with {:ok, result} <- do_query(state, args["message"]) do
      response = message |> Message.from_message() |> Message.set_message(result)

      output(state, :output, response)

      {:ok, response, state}
    else
      {:error, reason, state} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(reason)
        )

        send_stream_stop(state, :output, message)

        {:error, reason, state}
    end
  end

  def handle_tool_call(:parent, %Message{message: %{args: args}} = message, state) do
    send_stream_start(state, :output, message)

    with {:ok, result} <- do_parent(state, args["chunk_id"]) do
      response = message |> Message.from_message() |> Message.set_message(result)

      output(state, :output, response)

      {:ok, response, state}
    else
      {:error, reason, state} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(reason)
        )

        send_stream_stop(state, :output, message)

        {:error, reason, state}
    end
  end

  def handle_tool_call(:related, %Message{message: %{args: args}} = message, state) do
    send_stream_start(state, :output, message)

    with {:ok, result} <- do_related(state, args["chunk_id"]) do
      response = message |> Message.from_message() |> Message.set_message(result)

      output(state, :output, response)

      {:ok, response, state}
    end
  end

  defp do_query(state, query, tool_filters \\ %{}) do
    token_limit = option(state, :token_limit)
    token_limit = if token_limit == 0, do: nil, else: token_limit

    params =
      MemoryCollectionSearch.Params.from_map(%{
        search_query: query,
        where:
          Map.merge(tool_filters, with_where(state), fn _key, bot_value, set_value ->
            if set_value, do: set_value, else: bot_value
          end),
        limit: option(state, :limit),
        similarity_threshhold: option(state, :similarity_threshhold),
        extend_neighbors: option(state, :extend_neighbors),
        extend_parents: option(state, :extend_parents),
        token_limit: token_limit
      })

    with {:ok, collection, collection_name} <-
           memory().get_global_collection(state.context.context_id, option(state, :knowledge)),
         {:ok, vector_db} <-
           memory().get_vector_db(state.context.context_id, option(state, :knowledge)),
         {result, _total_tokens, embeddings_tokens} <-
           MemoryCollectionSearch.new(%{
             vector_db: vector_db,
             organization_collection_name: collection_name
           })
           |> MemoryCollectionSearch.search(params),
         _ <-
           create_run_and_collection_cost(
             state.context.context_id,
             state[:block_name],
             embeddings_tokens,
             collection.id
           ) do
      {:ok,
       result
       |> Enum.map(&DocumentSearchJSON.show(&1))}
    else
      {:error, reason} -> {:error, reason, state}
    end
  rescue
    _ -> {:error, :failed_to_search, state}
  end

  defp do_parent(state, nil), do: {:error, :not_found, state}

  defp do_parent(state, chunk_id) do
    with {:ok, _collection, collection_name} <-
           memory().get_global_collection(state.context.context_id, option(state, :knowledge)),
         {:ok, vector_db} <-
           memory().get_vector_db(state.context.context_id, option(state, :knowledge)) do
      MemoryCollectionSearch.new(%{
        vector_db: vector_db,
        organization_collection_name: collection_name
      })
      |> MemoryCollectionSearch.parent(chunk_id)
      |> then(&DocumentSearchJSON.show(&1))
      |> then(&{:ok, &1})
    else
      {:error, reason} -> {:error, reason, state}
    end
  rescue
    _ -> {:error, :failed_to_retrieve_parent, state}
  end

  defp do_related(state, chunk_id) do
    with {:ok, _collection, collection_name} <-
           memory().get_global_collection(state.context.context_id, option(state, :knowledge)),
         {:ok, vector_db} <-
           memory().get_vector_db(state.context.context_id, option(state, :knowledge)),
         chunk when is_map(chunk) <-
           Buildel.VectorDB.get_by_id(vector_db, collection_name, chunk_id) do
      params =
        MemoryCollectionSearch.Params.from_map(%{
          search_query: Map.get(chunk, "embedding"),
          where: with_where(state),
          limit: 2,
          similarity_threshhold: option(state, :similarity_threshhold),
          extend_neighbors: false,
          extend_parents: false,
          token_limit: nil
        })

      {result, _total_tokens, _embeddings_tokens} =
        MemoryCollectionSearch.new(%{
          vector_db: vector_db,
          organization_collection_name: collection_name
        })
        |> MemoryCollectionSearch.search(params)

      {:ok,
       result
       |> Enum.at(1)
       |> then(&DocumentSearchJSON.show(&1))}
    end
  rescue
    _ -> {:error, :failed_to_retrieve_related, state}
  end

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

  defp create_run_and_collection_cost(context_id, block_name, tokens, collection_id) do
    %{global: organization_id, parent: pipeline_id, local: run_id} =
      Context.context_from_context_id(context_id)

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
end

defmodule Buildel.Blocks.NewDocumentSearch.DocumentSearchJSON do
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
