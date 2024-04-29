defmodule Buildel.Memories.MemoryCollectionSearch do
  alias Buildel.Organizations.Organization
  alias Buildel.Memories
  alias Buildel.Memories.MemoryCollection
  alias Buildel.Organizations

  defstruct [:vector_db, :organization_collection_name]

  def new(%{
        vector_db: vector_db,
        organization_collection_name: organization_collection_name
      }) do
    %__MODULE__{
      vector_db: vector_db,
      organization_collection_name: organization_collection_name
    }
  end

  def new(%Organization{} = organization, %MemoryCollection{} = collection) do
    {:ok, api_key} =
      Organizations.get_organization_secret(organization, collection.embeddings_secret_name)

    organization_collection_name = Memories.organization_collection_name(organization, collection)

    vector_db =
      Buildel.VectorDB.new(%{
        adapter: Buildel.VectorDB.EctoAdapter,
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: collection.embeddings_api_type,
            model: collection.embeddings_model,
            api_key: api_key.value
          })
      })

    %__MODULE__{
      vector_db: vector_db,
      organization_collection_name: organization_collection_name
    }
  end

  defmodule Params do
    @default_params %{
      search_query: "",
      limit: 10,
      similarity_threshhold: 0,
      where: %{},
      token_limit: nil,
      extend_neighbors: false,
      extend_parents: false
    }

    defstruct [
      :search_query,
      :limit,
      :similarity_threshhold,
      :where,
      :token_limit,
      :extend_neighbors,
      :extend_parents
    ]

    def from_map(params) do
      %__MODULE__{} |> struct(Map.merge(@default_params, params))
    end
  end

  def search(
        %__MODULE__{
          vector_db: vector_db,
          organization_collection_name: collection_name
        } = module,
        %Params{} = params
      ) do
    with %{result: result, embeddings_tokens: embeddings_tokens} when is_list(result) <-
           Buildel.VectorDB.query(
             vector_db,
             collection_name,
             params.search_query,
             params.where,
             %{
               limit: params.limit,
               similarity_threshhold: params.similarity_threshhold
             }
           ) do
      extended_result =
        case params do
          %Params{extend_parents: true} ->
            module |> extend_parents_query(result)

          %Params{extend_neighbors: true} ->
            module |> extend_neighbors_query(result)

          _ ->
            result
        end

      {limited_result, result_tokens} = limit_result_and_count_tokens(extended_result, params)

      {limited_result, result_tokens, embeddings_tokens}
    else
      e -> e
    end
  end

  defp extend_parents_query(
         %__MODULE__{vector_db: vector_db, organization_collection_name: collection_name},
         result
       ) do
    Enum.map(result, fn chunk ->
      parent_context =
        case chunk["metadata"]["parent"] do
          nil ->
            [chunk["document"]]

          parent_id ->
            Buildel.VectorDB.get_by_parent_id(
              vector_db,
              collection_name,
              parent_id
            )
            |> Enum.map(fn chunk ->
              %{
                document: chunk["document"],
                pages: chunk["metadata"]["pages"]
              }
            end)
        end

      combined_document = parent_context |> Enum.map_join(" ", & &1.document)
      IO.inspect(parent_context)
      combined_pages = parent_context |> Enum.flat_map(& &1.pages) |> Enum.uniq()

      chunk
      |> Map.put("document", combined_document)
      |> Map.put("metadata", Map.put(chunk["metadata"], "pages", combined_pages))
    end)
  end

  defp extend_neighbors_query(
         %__MODULE__{vector_db: vector_db, organization_collection_name: collection_name},
         result
       ) do
    all_chunks =
      Buildel.VectorDB.get_all(
        vector_db,
        collection_name,
        %{}
      )

    Enum.map(result, fn chunk ->
      prev_id = Map.get(chunk["metadata"], "prev")
      next_id = Map.get(chunk["metadata"], "next")

      prev = Enum.find(all_chunks, %{}, fn c -> Map.get(c, "chunk_id") == prev_id end)
      next = Enum.find(all_chunks, %{}, fn c -> Map.get(c, "chunk_id") == next_id end)

      prev_doc = Map.get(prev, "document", "")
      next_doc = Map.get(next, "document", "")

      combined_document = [prev_doc, chunk["document"], next_doc] |> Enum.join(" ")

      combined_pages =
        (prev["metadata"]["pages"] ++ chunk["metadata"]["pages"] ++ next["metadata"]["pages"])
        |> Enum.uniq()

      chunk
      |> Map.put("metadata", Map.put(chunk["metadata"], "pages", combined_pages))
      |> Map.put("document", combined_document)
    end)
  end

  defp limit_result_and_count_tokens(result, %Params{} = params) do
    tokenizer = Buildel.Langchain.ChatGptTokenizer.init(%{})

    case params.token_limit do
      nil ->
        total = Enum.map_join(result, " ", & &1["document"])
        total_tokens = tokenizer |> Buildel.Langchain.ChatGptTokenizer.count_text_tokens(total)

        {result, total_tokens}

      token_limit ->
        {list, total} =
          result
          |> Enum.reduce_while({[], ""}, fn chunk, {list, total} ->
            new_total = total <> " " <> chunk["document"]

            total_tokens =
              tokenizer |> Buildel.Langchain.ChatGptTokenizer.count_text_tokens(new_total)

            if total_tokens > token_limit do
              {:halt, {list, total}}
            else
              {:cont, {[chunk | list], new_total}}
            end
          end)

        reversed_list = Enum.reverse(list)
        total_tokens = tokenizer |> Buildel.Langchain.ChatGptTokenizer.count_text_tokens(total)

        {reversed_list, total_tokens}
    end
  end
end
